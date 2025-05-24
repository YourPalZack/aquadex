# Frontend Development Tasks: Missing Pages and Components

## I. Missing Pages

### A. Authentication Pages
#### 1. Sign In Page (`/auth/signin/page.tsx`)
    - **Purpose:** To allow existing users to securely access their AquaDex accounts.
    - **Key UI Elements:**
        - Email/Username input field
        - Password input field
        - "Sign In" button
        - Link to "Sign Up" page
        - Link to "Forgot Password" page
        - AquaDex Logo/Branding
    - **Suggested File Path(s):** `src/app/auth/signin/page.tsx`, `src/components/auth/SignInForm.tsx`
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/auth/signin/page.tsx`.
        2. Develop the `SignInForm.tsx` component in `src/components/auth/`.
        3. Use Shadcn UI components: `Input` for email and password, `Button` for submission, `Label` for fields.
        4. Form should collect email/username and password.
        5. Implement basic client-side validation (e.g., required fields, email format).
        6. Include navigation links to the Sign Up and Forgot Password pages.
        7. Style the page for a clean and trustworthy appearance, consistent with the app's design.
        8. (Future) Connect form submission to authentication logic.
#### 2. Sign Up Page (`/auth/signup/page.tsx`)
    - **Purpose:** To enable new users to create an AquaDex account.
    - **Key UI Elements:**
        - Username input field
        - Email input field
        - Password input field
        - Confirm Password input field
        - "Sign Up" button
        - Link to "Sign In" page
        - AquaDex Logo/Branding
    - **Suggested File Path(s):** `src/app/auth/signup/page.tsx`, `src/components/auth/SignUpForm.tsx`
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/auth/signup/page.tsx`.
        2. Develop the `SignUpForm.tsx` component in `src/components/auth/`.
        3. Use Shadcn UI components: `Input` for fields, `Button` for submission, `Label` for fields.
        4. Form should collect username, email, password, and password confirmation.
        5. Implement basic client-side validation (e.g., required fields, email format, password match).
        6. Include a navigation link to the Sign In page.
        7. Style the page for a welcoming and straightforward user experience.
        8. (Future) Connect form submission to account creation logic.
#### 3. Forgot Password Page (`/auth/forgot-password/page.tsx`)
    - **Purpose:** To allow users who have forgotten their password to initiate the password reset process.
    - **Key UI Elements:**
        - Email input field
        - "Send Reset Link" button (or similar text)
        - Link to "Sign In" page
        - AquaDex Logo/Branding
    - **Suggested File Path(s):** `src/app/auth/forgot-password/page.tsx`, `src/components/auth/ForgotPasswordForm.tsx`
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/auth/forgot-password/page.tsx`.
        2. Develop the `ForgotPasswordForm.tsx` component in `src/components/auth/`.
        3. Use Shadcn UI components: `Input` for email, `Button` for submission, `Label` for field.
        4. Form should collect the user's registered email address.
        5. Implement basic client-side validation (e.g., required field, email format).
        6. Include a navigation link back to the Sign In page.
        7. Provide clear instructions to the user about the process.
        8. (Future) Connect form submission to the backend logic for sending a password reset email.
#### 4. Reset Password Page (`/auth/reset-password/page.tsx`)
    - **Purpose:** To allow users to set a new password after verifying their identity via a reset link.
    - **Key UI Elements:**
        - New Password input field
        - Confirm New Password input field
        - "Reset Password" button
        - AquaDex Logo/Branding
        - (Potentially) Hidden token field or way to pass reset token
    - **Suggested File Path(s):** `src/app/auth/reset-password/page.tsx`, `src/components/auth/ResetPasswordForm.tsx`
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/auth/reset-password/page.tsx` (this page will likely require a dynamic segment for the reset token, e.g., `/auth/reset-password/[token]/page.tsx`).
        2. Develop the `ResetPasswordForm.tsx` component in `src/components/auth/`.
        3. Use Shadcn UI components: `Input` for password fields, `Button` for submission, `Label` for fields.
        4. Form should collect the new password and its confirmation.
        5. Implement basic client-side validation (e.g., required fields, password complexity, password match).
        6. Style the page securely and clearly.
        7. (Future) Connect form submission to the backend logic for updating the user's password, validating the reset token.

### B. Contact Us Page
#### 1. Contact Us Page (`/contact-us/page.tsx`)
    - **Purpose:** To provide users, potential partners, and brands with a straightforward way to send inquiries or get in touch with the AquaDex team.
    - **Key UI Elements:**
        - Contact Form (`ContactForm.tsx`):
            - Name input field
            - Email input field
            - Subject input field (optional, or a dropdown of topics)
            - Message textarea
            - "Send Message" button
        - Optional: Company contact information (e.g., email address, links to social media if applicable).
        - Clear title and introductory text.
    - **Suggested File Path(s):** `src/app/contact-us/page.tsx`, `src/components/static/ContactForm.tsx` (Consider if `static` is the best sub-directory for forms, or perhaps `src/components/forms/`)
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/contact-us/page.tsx`.
        2. Develop the `ContactForm.tsx` component, potentially in `src/components/forms/` or `src/components/contact/`.
        3. Use Shadcn UI components: `Input` for name, email, subject; `Textarea` for the message; `Button` for submission; `Label` for fields.
        4. Implement basic client-side validation (e.g., required fields, email format).
        5. On successful (mock) submission, display a confirmation message to the user.
        6. Style the page to be inviting and easy to use.
        7. (Future) Integrate form submission with a backend service or email sending mechanism.

### C. User-Specific Marketplace Pages (Profile Section)
#### 1. My Listings Page (`/profile/my-listings/page.tsx`)
    - **Purpose:** To provide approved sellers a dedicated area within their profile to view, manage, and track the status of their listings in the AquaDex marketplace.
    - **Key UI Elements:**
        - Page Title (e.g., "My Marketplace Listings").
        - Tabs or filters for different listing statuses (e.g., "Active," "Sold," "Draft," "Expired").
        - A table or grid (`MyListingsTable.tsx` or `MyListingsGrid.tsx`) displaying:
            - Listing title/image thumbnail.
            - Price.
            - Date listed.
            - Current status.
            - Number of views/inquiries (if tracked).
            - Action buttons/links (e.g., "Edit," "Mark as Sold," "Delete," "Renew").
        - Link/Button to create a new listing.
    - **Suggested File Path(s):** `src/app/profile/my-listings/page.tsx`, `src/components/marketplace/MyListingsTable.tsx` (or `MyListingsGrid.tsx`)
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/profile/my-listings/page.tsx`.
        2. Develop the `MyListingsTable.tsx` (or `MyListingsGrid.tsx`) component in `src/components/marketplace/`.
        3. Use Shadcn UI `Table` or custom grid layout with `Card` components for listings.
        4. Implement functionality for fetching and displaying the user's listings.
        5. Include sorting and filtering options for the listings.
        6. Action buttons should link to appropriate functionalities (editing listing, changing status).
        7. Ensure the page is responsive and provides a clear overview of listings.
        8. (Future) Integrate with backend to fetch and update listing data.

### D. Notification Management Page (Profile Section)
#### 1. Notification Settings Page (`/profile/notifications/page.tsx`)
    - **Purpose:** To allow users to control which types of email or in-app notifications they receive from AquaDex, enhancing user experience and reducing unwanted alerts.
    - **Key UI Elements:**
        - Page title (e.g., "Notification Settings").
        - A series of toggles or checkboxes for different notification categories:
            - Water change reminders.
            - Marketplace alerts (e.g., new items in saved searches, offers).
            - Q&A notifications (e.g., replies to their posts, mentions).
            - General announcements or newsletters.
        - "Save Preferences" button.
    - **Suggested File Path(s):** `src/app/profile/notifications/page.tsx`, `src/components/profile/NotificationSettingsForm.tsx`
    - **Implementation Steps:**
        1. Create Next.js page route at `src/app/profile/notifications/page.tsx`.
        2. Develop the `NotificationSettingsForm.tsx` component in `src/components/profile/`.
        3. Use Shadcn UI `Switch` or `Checkbox` components for each notification preference.
        4. Use Shadcn UI `Label` to describe each preference.
        5. Form should load current user notification preferences.
        6. On "Save Preferences", provide feedback.
        7. (Future) Integrate with backend to save and apply notification settings.


## II. Missing Components (or Components Needing Significant Enhancement)

### A. Q&A Abuse Reporting
#### 1. Report Button (`ReportButton.tsx`)
    - **Purpose:** To allow users to easily flag a question or answer within the Q&A section that they believe violates community guidelines or is abusive.
    - **Key UI Elements:**
        - Icon button (e.g., a flag icon or "report" text).
        - Tooltip explaining the button's function.
    - **Suggested File Path:** `src/components/qa/ReportButton.tsx`
    - **Implementation Steps:**
        1. Create the `ReportButton.tsx` React component in `src/components/qa/`.
        2. Use a Shadcn UI `Button` component, likely with `variant="ghost"` or `variant="outline"` and an appropriate icon from Lucide Icons (e.g., `Flag`).
        3. Implement an `onClick` handler that will trigger the display of the `ReportDialog.tsx`.
        4. Ensure the button is clearly visible yet unobtrusive on Q&A entries.
        5. Include accessibility considerations (e.g., `aria-label`).
#### 2. Report Dialog/Form (`ReportDialog.tsx`)
    - **Purpose:** To provide a structured way for users to submit details about the content they are reporting, helping moderators understand the issue.
    - **Key UI Elements:**
        - Dialog title (e.g., "Report Content").
        - Dropdown or radio button group for selecting the reason for reporting (e.g., "Spam," "Harassment," "Inappropriate Content").
        - Textarea for providing additional details or comments.
        - "Submit Report" button.
        - "Cancel" button.
    - **Suggested File Path:** `src/components/qa/ReportDialog.tsx`
    - **Implementation Steps:**
        1. Create the `ReportDialog.tsx` React component in `src/components/qa/`.
        2. Use Shadcn UI `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
        3. Inside the dialog, create a form using Shadcn UI `Select` (for reason), `Textarea` (for details), and `Button` components.
        4. Manage the state of the dialog (open/closed) and form inputs.
        5. On submission, provide feedback to the user (e.g., "Report submitted").
        6. (Future) Integrate submission with a backend mechanism for flagging content and alerting moderators.

### B. User Profile Enhancements
#### 1. Edit Profile Form (`EditProfileForm.tsx`)
    - **Purpose:** To enable users to update and personalize their profile information, such as display name, biography, avatar, and potentially other user-specific settings.
    - **Key UI Elements:**
        - Input field for Display Name.
        - Textarea for User Biography/Description.
        - Avatar upload/selection component.
        - "Save Changes" button.
        - "Cancel" button or link.
    - **Suggested File Path:** `src/components/profile/EditProfileForm.tsx`
    - **Implementation Steps:**
        1. Create the `EditProfileForm.tsx` React component in `src/components/profile/`.
        2. Use Shadcn UI components: `Input`, `Textarea`, `Button`, `Avatar` (or a custom uploader).
        3. The form should pre-fill with existing user data if available.
        4. Manage form state and handle input changes.
        5. On submission, provide feedback (e.g., "Profile updated successfully").
        6. (Future) Integrate with backend to persist profile changes.
        7. This form would be integrated into the main `/profile/page.tsx`.

### C. Aquarium Management Enhancements
#### 1. Aquarium Detail Display (`AquariumDetailView.tsx`)
    - **Purpose:** To provide a comprehensive and well-organized view of all information related to a specific aquarium, displayed on the `src/app/aquariums/[aquariumId]/page.tsx` page.
    - **Key UI Elements:**
        - Aquarium Name/Title.
        - Key parameters display (e.g., latest test results, ideal ranges).
        - Sections for:
            - Inhabitants (list, species, count).
            - Plants (list, species).
            - Equipment (filters, heaters, lighting - with details).
            - Maintenance Log (recent water changes, filter cleaning).
            - Notes section.
        - Links/Buttons to edit aquarium details or log new maintenance.
    - **Suggested File Path:** `src/components/aquariums/AquariumDetailView.tsx`
    - **Implementation Steps:**
        1. Create the `AquariumDetailView.tsx` component in `src/components/aquariums/`.
        2. Design the layout to clearly present diverse information (use Shadcn `Card`, `Tabs`, `Accordion` as needed).
        3. Fetch and display data for the specific aquarium.
        4. Ensure responsive design for various screen sizes.
        5. This component will be the main content for `src/app/aquariums/[aquariumId]/page.tsx`.

#### 2. Extended Aquarium Form (`EditAquariumForm.tsx` or enhance `AquariumForm.tsx`)
    - **Purpose:** To allow users to add new aquariums or edit existing ones with detailed information including inhabitants, plants, equipment, and general notes, going beyond basic setup.
    - **Key UI Elements:**
        - Form fields for:
            - Aquarium Name, Dimensions/Volume, Substrate type.
            - Inhabitants: Ability to add/remove/edit entries (species, quantity, notes).
            - Plants: Ability to add/remove/edit entries (species, quantity, notes).
            - Equipment: Sections for filter, heater, lighting, CO2 system, etc. (model, notes).
            - General notes textarea.
        - "Save Aquarium" / "Update Aquarium" button.
    - **Suggested File Path:** `src/components/aquariums/EditAquariumForm.tsx` (or modify `src/components/aquariums/AquariumForm.tsx`)
    - **Implementation Steps:**
        1. Decide whether to create a new `EditAquariumForm.tsx` or significantly enhance the existing `AquariumForm.tsx`.
        2. Use Shadcn UI components for form fields (`Input`, `Textarea`, `Select`, potentially dynamic list components for inhabitants/plants/equipment).
        3. If editing, pre-fill the form with existing aquarium data.
        4. Implement logic for adding, removing, and editing list items within the form (e.g., for multiple fish species).
        5. Provide clear user feedback on save/update.
        6. (Future) Integrate with backend to persist aquarium data.
