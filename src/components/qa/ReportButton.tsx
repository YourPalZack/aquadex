"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ReportDialog from "./ReportDialog"

interface ReportButtonProps {
  contentId: string
  contentType: 'question' | 'answer'
  className?: string
}

export default function ReportButton({ 
  contentId, 
  contentType, 
  className 
}: ReportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className={`text-gray-500 hover:text-red-600 ${className}`}
              aria-label={`Report this ${contentType}`}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Report this {contentType}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ReportDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contentId={contentId}
        contentType={contentType}
      />
    </>
  )
}