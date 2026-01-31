# Gas Station Management Project - Detailed Workflow

This document provides a comprehensive step-by-step walkthrough of the entire Gas Station Management application, covering every feature from login to minute operational details.

---

## 1. Authentication & Access Control

### Login Flow
- **Entry Point**: When the app opens, users are presented with the Login screen (`/login`).
- **Credentials**: Users log in using their **Email** and **Password**.
- **System**: Authentication is handled via **Firebase Auth**.
- **Role Detection**: Upon login, the system fetches the user's profile from the Firestore `users` collection to determine their role:
    - **Admin/Owner**: Full access to all features.
    - **Staff/Manager**: Restricted access (e.g., cannot approve their own leaves/expenses depending on specific logic).
- **Redirection**: Successful login redirects the user to the **Dashboard**.

---

## 2. Dashboard & Overview

### Main Dashboard (`/dashboard`)
The dashboard serves as the command center, providing real-time insights:
- **Tank Status Cards**: Visual representation of Fuel Tanks (Petrol & Diesel).
    - Shows **Current Capacity**, **Total Capacity**, and **Percentage Full**.
    - Color-coded bars (Orange for Petrol, Blue for Diesel).
- **Quick Metrics**:
    - **Today's Sale**: Total liters of fuel sold today.
    - **Today's Revenue**: Estimated revenue based on today's sales.
- **Quick Actions**:
    - **Add Fuel Intake**: Button to record new fuel delivery from a tanker.
    - **Add Daily Reading**: Shortcut to the Readings deduction page.
- **Recent Transactions**: A list of the latest 5 financial activities (Fuel sales, Expenses, Payments).
- **Attendance Widget**: A sidebar widget showing a quick summary of today's staff attendance.

---

## 3. Fuel Tank Management

### Fuel Intake (Restocking)
- **Trigger**: Click **"Add Fuel Intake"** on the Dashboard.
- **Workflow**:
    1.  **Modal Opens**: A form appears.
    2.  **Select Fuel Type**: Choose between **Petrol (MS)** or **Diesel (HSD)**.
    3.  **Enter Quantity**: Input the amount in **Liters** being added to the underground tank.
    4.  **Date**: Defaults to today, but can be backdated.
    5.  **Invoice/Ref No**: Optional field to track the supplier's invoice number.
    6.  **Submit**: Updates the tank balance in the system.

---

## 4. Daily Readings & Sales

### Readings Page (`/readings`)
This is the core operational feature where daily pump meter readings are entered.

### Adding a New Reading
1.  **Navigate**: Go to the **Readings** page and click **"Add Reading"**.
2.  **Select Date**: Choose the date for the reading (usually the current day).
3.  **Set Prices**: Enter the daily rate (Price/Liter) for **Petrol** and **Diesel**.
4.  **Pump Entries**:
    - The system lists all configured pumps (e.g., Pump 1, Pump 2).
    - **Opening Reading**: Auto-populated from the *previous day's closing reading* to ensure continuity.
    - **Closing Reading**: User enters the current meter reading at the end of the shift.
    - **Meter Photo**: Option to upload a photo of the physical meter for verification.
5.  **Auto-Calculation**:
    - **Sales (Liters)** = Closing Reading - Opening Reading.
    - **Revenue (₹)** = Sales (Liters) * Price per Liter.
6.  **Submission**: Saving the form records the total sales and revenue for the day.

### Viewing & Editing
- **List View**: Shows a summary of each day's total Petrol/Diesel usage.
- **Expand**: Clicking a daily entry expands it to show the breakdown per pump.
- **Edit**: Users can reopen a past reading to correct mistakes.
- **Deleted**: Remove an erroneous entry (with confirmation).

---

## 5. Staff Management (HR)

### Staff List (`/staff`)
- **View**: Lists all employees with their details:
    - **Name, Role, Email**.
    - **Monthly Salary**.
    - **Advances Taken**: Calculated from approved advance requests.
    - **Net Payable**: Salary minus Advances.
- **Add Staff**:
    - Click **"Add Staff"**.
    - detailed form requires: **Name**, **Role** (Manager/Attendant), **Monthly Salary**, **Login Email**, and **Temporary Password**.
    - This creates *both* a comprehensive profile in the database and a login account for them to access the app.

### Attendance (`/attendance`)
- **Calendar View**: Navigate through days to mark or view attendance.
- **Stats**: Shows Total Staff, Present, Absent, and Attendance %.
- **Action**:
    - **Mark Present/Absent**: Toggle status for each employee.
    - **Mark All Present**: Quick button for days with full attendance.

### Leave Management (`/leaves`)
- **Requesting Leave**:
    - Staff can request leave for themselves.
    - Admins can record leave on behalf of staff.
    - **Fields**: Staff Name, Start Date, End Date, Type (Sick, Casual, etc.), and Reason.
- **Approval Flow**:
    - Requests appear as **Pending**.
    - Admins can **Approve** or **Reject** requests.
    - Status updates are tracked with the approver's name and date.

---

## 6. Customer Khata (Credit) Management

### Customers Page (`/customers`)
- **Directory**: Searchable list of all credit customers.
- **Add Customer**: Quick modal to add a new client by Name.

### Customer Details (`/customers/:id`)
- **Individual Ledger**: Click on a customer to see their full history.
- **Financial Summary**:
    - **Total Usage**: Total value of fuel taken on credit.
    - **Total Paid**: Total amount paid back by the customer.
    - **Due Amount**: Outstanding balance (Red color if positive).
- **Add Transaction**:
    - **Fuel Usage**: Record a credit sale (increases due).
    - **Payment**: Record a payment received (decreases due).
    - **Evidence**: Optional photo upload for receipts or signed slips.
- **Transaction History**: A chronological table of all their activities with running balances.

---

## 7. Expense Management & Finance

### Expenses Page (`/expenses`)
- **General Expenses**:
    - Track operational costs (Electricity, Tea, Maintenance).
    - **Fields**: Date, Description, Amount, Receipt Photo.
- **Staff Advances**:
    - Specialized expense type.
    - Select a **Staff Member** and enter the **Advance Amount**.
    - This automatically links to the Staff page, deducting from their "Net Payable" salary.
- **View Receipts**: Click the receipt icon on any entry to view the attached image.

### Finance Approvals (`/approvals`)
- **Workflow**: For larger or regulated expenses that require authorization.
- **Raise Ticket**: Staff raises a request with **Amount**, **Category** (Operational, Salary, etc.), and **Description**.
- **Admin Action**: Admins review tickets and set status to **Approved** or **Rejected**.

---

## Technical Details
- **Database**: All data is stored in **Firebase Firestore** for real-time updates.
- **Images**: Receipt and meter photos are stored as base64 strings or URLs (depending on implementation specifics).
- **Offline Capable**: The app state management allows for fluid navigation, though internet is required for syncing.
