# DGMS Hub Admin Panel User Manual

This manual provides step-by-step instructions for using the DGMS Hub Admin Panel.

## Getting Started

### Accessing the Admin Panel

1. Open your web browser
2. Navigate to `https://admin.yourdomain.com`
3. You will see the login screen

### Logging In

1. Enter your email address
2. Enter your password
3. Click "Sign In"

**Default Credentials (Change immediately after first login):**
- Email: `admin@dgms.edu`
- Password: `admin123`

### First Login Setup

After your first login:

1. Click on your profile avatar in the top-right corner
2. Select "Profile" from the dropdown menu
3. Update your personal information
4. **Change your password immediately**
5. Configure your notification preferences

## Dashboard

The dashboard provides an overview of your system:

### Statistics Cards
- **Total Applications**: Number of applications in the system
- **Active Applications**: Number of currently active applications
- **Total Users**: Number of admin panel users
- **Audit Logs**: Recent system activity count

### Recent Activity
- View recently added applications
- Monitor system status
- Check database connectivity

## Managing Applications

### Viewing Applications

1. Click "Applications" in the sidebar
2. View the list of all applications
3. Use the search bar to find specific applications
4. Filter by category using the dropdown

### Adding a New Application

1. Click "Applications" in the sidebar
2. Click the "Add Application" button
3. Fill in the required information:
   - **Name**: Display name for the application
   - **Description**: Brief description of the application
   - **URL**: Web address of the application
   - **Category**: Select or create a category
   - **Icon**: Upload an icon image (optional)
   - **Colors**: Set background and text colors
   - **Settings**: Configure authentication and display options

4. Click "Save" to create the application

### Editing an Application

1. Find the application in the list
2. Click the "Edit" button (pencil icon)
3. Modify the information as needed
4. Click "Save Changes"

### Deleting an Application

1. Find the application in the list
2. Click the "Delete" button (trash icon)
3. Confirm the deletion in the popup dialog

**Warning**: Deleted applications cannot be recovered.

### Reordering Applications

1. Click "Applications" in the sidebar
2. Click the "Reorder" button
3. Drag and drop applications to change their order
4. Click "Save Order" to apply changes

The order determines how applications appear in the mobile app.

### Managing Categories

Categories help organize applications:

1. Applications are automatically grouped by category
2. Create new categories by typing a new name when adding/editing applications
3. Unused categories are automatically removed

## User Management (Admin Only)

### Viewing Users

1. Click "Users" in the sidebar
2. View the list of all admin panel users
3. See user roles, status, and last login information

### Adding a New User

1. Click "Users" in the sidebar
2. Click the "Add User" button
3. Fill in the user information:
   - **Username**: Unique username
   - **Email**: User's email address
   - **Password**: Temporary password (user should change on first login)
   - **First Name**: User's first name
   - **Last Name**: User's last name
   - **Role**: Select Admin or Moderator

4. Click "Create User"

### User Roles

- **Admin**: Full access to all features including user management
- **Moderator**: Can manage applications but cannot manage users

### Editing a User

1. Find the user in the list
2. Click the "Edit" button
3. Modify the information as needed
4. Click "Save Changes"

### Deactivating a User

1. Find the user in the list
2. Click the "Edit" button
3. Uncheck "Active" status
4. Click "Save Changes"

Deactivated users cannot log in but their data is preserved.

### Deleting a User

1. Find the user in the list
2. Click the "Delete" button
3. Confirm the deletion

**Warning**: You cannot delete your own account or the last admin user.

## Audit Logs (Admin Only)

### Viewing Audit Logs

1. Click "Audit Logs" in the sidebar
2. View chronological list of system activities
3. See who performed what actions and when

### Filtering Audit Logs

Use the filters to find specific activities:
- **Date Range**: Select start and end dates
- **User**: Filter by specific user
- **Action**: Filter by action type (Create, Update, Delete, etc.)
- **Entity**: Filter by what was affected (User, Application, etc.)

### Understanding Audit Entries

Each audit log entry shows:
- **Timestamp**: When the action occurred
- **User**: Who performed the action
- **Action**: What was done
- **Entity**: What was affected
- **Details**: Specific changes made

### Exporting Audit Logs

1. Apply desired filters
2. Click "Export" button
3. Choose format (CSV, PDF)
4. Download the file

## Settings

### System Settings

1. Click "Settings" in the sidebar
2. Configure system-wide options:
   - **General**: System name, description
   - **Email**: SMTP settings for notifications
   - **Security**: Password policies, session timeouts
   - **Backup**: Automated backup settings

### Notification Settings

Configure when and how you receive notifications:
- **Email Notifications**: System alerts, user activities
- **In-App Notifications**: Real-time updates
- **Frequency**: Immediate, daily digest, weekly summary

## Profile Management

### Updating Your Profile

1. Click your avatar in the top-right corner
2. Select "Profile"
3. Update your information:
   - **Personal Information**: Name, email
   - **Password**: Change your password
   - **Preferences**: Language, timezone
   - **Notifications**: Personal notification settings

### Changing Your Password

1. Go to your Profile page
2. Click "Change Password"
3. Enter your current password
4. Enter your new password
5. Confirm your new password
6. Click "Update Password"

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Mobile App Integration

### How the Mobile App Works

The mobile app automatically fetches:
- Active applications from your admin panel
- Application icons and colors
- Category organization
- Display order

### Testing Changes

After making changes in the admin panel:
1. Changes are immediately available to the mobile app
2. Mobile app users may need to refresh or restart the app
3. Use the mobile app to test your changes

### Troubleshooting Mobile App Issues

If mobile app users report issues:
1. Check if applications are marked as "Active"
2. Verify application URLs are accessible
3. Ensure icons are uploaded and display correctly
4. Check the audit logs for any errors

## Best Practices

### Application Management
- Use clear, descriptive names for applications
- Keep descriptions concise but informative
- Use consistent icon styles and sizes
- Organize applications into logical categories
- Test all URLs before adding applications

### Security
- Change default passwords immediately
- Use strong, unique passwords
- Regularly review user accounts
- Monitor audit logs for suspicious activity
- Keep the system updated

### Maintenance
- Regularly review and update application information
- Remove unused applications
- Monitor system performance
- Backup data regularly
- Review user access periodically

## Troubleshooting

### Common Issues

**Cannot Log In**
- Verify email and password
- Check if account is active
- Clear browser cache and cookies
- Contact system administrator

**Application Not Showing in Mobile App**
- Ensure application is marked as "Active"
- Check application URL is valid
- Verify mobile app is connected to internet
- Try refreshing the mobile app

**File Upload Issues**
- Check file size (maximum 5MB)
- Ensure file format is supported (JPEG, PNG, GIF, WebP, SVG)
- Try a different browser
- Check internet connection

**Performance Issues**
- Clear browser cache
- Close unnecessary browser tabs
- Check internet connection
- Contact system administrator

### Getting Help

For technical support:
- **Email**: support@dgms.edu
- **Phone**: (555) 123-4567
- **Help Desk**: Available Monday-Friday, 8 AM - 5 PM

For training and user support:
- **User Manual**: This document
- **Video Tutorials**: Available on the school intranet
- **In-Person Training**: Contact IT department to schedule

## Appendix

### Keyboard Shortcuts

- **Ctrl+S**: Save current form
- **Ctrl+F**: Search/Filter
- **Esc**: Close modal dialogs
- **Tab**: Navigate between form fields

### Browser Compatibility

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### System Requirements

- Stable internet connection
- Modern web browser
- JavaScript enabled
- Cookies enabled

---

*This manual is updated regularly. Last updated: January 2024*
