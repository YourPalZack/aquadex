/**
 * Alert Detection Utilities
 * Functions for detecting and creating parameter alerts from water test results
 */

import type { 
  WaterTest, 
  ParameterThreshold, 
  ParameterAlert, 
  ParameterAlertSeverity,
  AlertNotificationMethod 
} from '@/types/aquarium';

interface AlertDetectionResult {
  alerts: ParameterAlert[];
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    totalCount: number;
  };
}

/**
 * Analyzes a water test against thresholds and generates alerts for parameters outside safe ranges
 */
export function detectParameterAlerts(
  waterTest: WaterTest,
  thresholds: ParameterThreshold[],
  aquariumId: string,
  userId: string
): AlertDetectionResult {
  const alerts: ParameterAlert[] = [];
  const summary = {
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0,
  };

  waterTest.parameters.forEach(parameter => {
    const threshold = thresholds.find(t => 
      t.parameterName === parameter.name && 
      t.aquariumId === aquariumId &&
      t.enabled
    );

    if (!threshold) return; // No threshold configured for this parameter

    const alert = checkParameterThreshold(
      parameter.name,
      parameter.value,
      parameter.unit,
      threshold,
      waterTest,
      aquariumId,
      userId
    );

    if (alert) {
      alerts.push(alert);
      summary.totalCount++;
      
      switch (alert.severity) {
        case 'critical':
          summary.criticalCount++;
          break;
        case 'high':
          summary.highCount++;
          break;
        case 'medium':
          summary.mediumCount++;
          break;
        case 'low':
          summary.lowCount++;
          break;
      }
    }
  });

  return { alerts, summary };
}

/**
 * Checks a single parameter value against its threshold configuration
 */
function checkParameterThreshold(
  parameterName: string,
  value: number,
  unit: string,
  threshold: ParameterThreshold,
  waterTest: WaterTest,
  aquariumId: string,
  userId: string
): ParameterAlert | null {
  let severity: ParameterAlertSeverity | null = null;
  let alertType: 'high' | 'low' | null = null;

  // Check critical thresholds first (highest priority)
  if (threshold.criticalMin !== undefined && value < threshold.criticalMin) {
    severity = 'critical';
    alertType = 'low';
  } else if (threshold.criticalMax !== undefined && value > threshold.criticalMax) {
    severity = 'critical';
    alertType = 'high';
  }
  // Check warning thresholds
  else if (threshold.warningMin !== undefined && value < threshold.warningMin) {
    severity = 'high';
    alertType = 'low';
  } else if (threshold.warningMax !== undefined && value > threshold.warningMax) {
    severity = 'high';
    alertType = 'high';
  }
  // Check if outside ideal range (medium priority)
  else if (
    (threshold.idealMin !== undefined && value < threshold.idealMin) ||
    (threshold.idealMax !== undefined && value > threshold.idealMax)
  ) {
    severity = 'medium';
    alertType = value < (threshold.idealMin || 0) ? 'low' : 'high';
  }

  // No alert needed if within all thresholds
  if (!severity || !alertType) {
    return null;
  }

  // Generate alert
  const alert: ParameterAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    aquariumId,
    userId,
    thresholdId: threshold.id,
    testId: waterTest.id,
    parameterName,
    parameterValue: value,
    unit,
    severity,
    status: 'active',
    title: generateAlertTitle(parameterName, severity, alertType),
    message: generateAlertMessage(parameterName, value, unit, severity, alertType, threshold),
    triggeredAt: new Date(),
    notificationsSent: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return alert;
}

/**
 * Generates a human-readable alert title
 */
function generateAlertTitle(
  parameterName: string,
  severity: ParameterAlertSeverity,
  alertType: 'high' | 'low'
): string {
  const severityLabel = severity === 'critical' ? 'Critical' : 
                       severity === 'high' ? 'High' : 
                       severity === 'medium' ? 'Warning' : 'Notice';

  const typeLabel = alertType === 'high' ? 'High' : 'Low';

  return `${severityLabel} ${parameterName} Level - ${typeLabel}`;
}

/**
 * Generates a detailed alert message with recommendations
 */
function generateAlertMessage(
  parameterName: string,
  value: number,
  unit: string,
  severity: ParameterAlertSeverity,
  alertType: 'high' | 'low',
  threshold: ParameterThreshold
): string {
  const directionText = alertType === 'high' ? 'above' : 'below';
  const thresholdValue = alertType === 'high' ? 
    (severity === 'critical' ? threshold.criticalMax : 
     severity === 'high' ? threshold.warningMax : threshold.idealMax) :
    (severity === 'critical' ? threshold.criticalMin : 
     severity === 'high' ? threshold.warningMin : threshold.idealMin);

  let recommendation = '';

  // Generate parameter-specific recommendations
  switch (parameterName.toLowerCase()) {
    case 'ammonia':
      if (alertType === 'high') {
        recommendation = severity === 'critical' 
          ? 'Immediate large water change (50%+) required. Check filtration system and reduce feeding.'
          : 'Perform water change (25-30%) and test filter media. Consider reducing feeding temporarily.';
      }
      break;
    
    case 'nitrite':
      if (alertType === 'high') {
        recommendation = severity === 'critical'
          ? 'Emergency water change needed. Add aquarium salt (if safe for species) and check biological filtration.'
          : 'Perform water change and ensure proper biological filtration. Monitor daily.';
      }
      break;
    
    case 'nitrate':
      if (alertType === 'high') {
        recommendation = severity === 'critical'
          ? 'Large water change required (40-50%). Increase water change frequency and check feeding habits.'
          : 'Perform water change (25-30%) and consider increasing regular maintenance schedule.';
      }
      break;
    
    case 'ph':
      recommendation = alertType === 'high'
        ? 'pH is too high. Consider using pH decreaser or adding driftwood. Monitor closely.'
        : 'pH is too low. Consider using pH increaser or adding crushed coral. Test KH levels.';
      break;
    
    case 'temperature':
      recommendation = alertType === 'high'
        ? 'Temperature too high. Check heater settings, increase surface agitation, and ensure proper room temperature.'
        : 'Temperature too low. Check heater function and consider upgrading heater capacity.';
      break;
    
    default:
      recommendation = severity === 'critical'
        ? 'Immediate attention required. Take corrective action and retest within 2-4 hours.'
        : 'Monitor parameter closely and take appropriate corrective measures.';
  }

  return `${parameterName} level of ${value}${unit} is ${directionText} ${severity} threshold (${thresholdValue}${unit}). ${recommendation}`;
}

/**
 * Formats alert notifications for different delivery methods
 */
export function formatAlertNotification(
  alert: ParameterAlert,
  method: AlertNotificationMethod,
  aquariumName?: string
): { subject: string; body: string } {
  const aquariumText = aquariumName ? ` in ${aquariumName}` : '';
  
  switch (method) {
    case 'email':
      return {
        subject: `🚨 Aquadex Alert: ${alert.title}${aquariumText}`,
        body: `
Hello,

Your aquarium${aquariumText} has triggered a ${alert.severity} alert:

${alert.title}
${alert.message}

Parameter Details:
- ${alert.parameterName}: ${alert.parameterValue}${alert.unit}
- Severity: ${alert.severity.toUpperCase()}
- Triggered: ${alert.triggeredAt.toLocaleString()}

Please check your aquarium and take appropriate action. You can manage this alert in the Aquadex app.

Best regards,
The Aquadex Team
        `.trim()
      };
    
    case 'sms':
      return {
        subject: '',
        body: `Aquadex Alert: ${alert.parameterName} ${alert.parameterValue}${alert.unit} ${alert.severity}${aquariumText}. ${alert.message.split('.')[0]}.`
      };
    
    case 'push':
      return {
        subject: alert.title,
        body: `${alert.parameterName}: ${alert.parameterValue}${alert.unit} - ${alert.message.split('.')[0]}.`
      };
    
    case 'in-app':
    default:
      return {
        subject: alert.title,
        body: alert.message
      };
  }
}

/**
 * Determines if an alert should trigger notifications based on severity and user preferences
 */
export function shouldSendNotification(
  alert: ParameterAlert,
  threshold: ParameterThreshold,
  method: AlertNotificationMethod
): boolean {
  // Check if notification method is enabled for this threshold
  if (!threshold.notificationMethods.includes(method)) {
    return false;
  }

  // Check if threshold is currently snoozed
  if (threshold.snoozeUntil && threshold.snoozeUntil > new Date()) {
    return false;
  }

  // Always send critical alerts
  if (alert.severity === 'critical') {
    return true;
  }

  // Send high severity alerts
  if (alert.severity === 'high') {
    return true;
  }

  // Send medium/low alerts only via in-app by default
  if (alert.severity === 'medium' || alert.severity === 'low') {
    return method === 'in-app';
  }

  return false;
}

/**
 * Batches multiple alerts for efficient notification delivery
 */
export function batchAlerts(alerts: ParameterAlert[]): {
  critical: ParameterAlert[];
  high: ParameterAlert[];
  medium: ParameterAlert[];
  low: ParameterAlert[];
} {
  return {
    critical: alerts.filter(a => a.severity === 'critical'),
    high: alerts.filter(a => a.severity === 'high'),
    medium: alerts.filter(a => a.severity === 'medium'),
    low: alerts.filter(a => a.severity === 'low'),
  };
}