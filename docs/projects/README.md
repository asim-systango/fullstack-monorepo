# Project briefs

One shared codebase: domain in `apps/api`, UI in `apps/web`, auth on `apps/api-gateway`.

Do **not** recreate users/auth in the domain API — store `userId` FKs and reuse gateway roles. Env: root + `apps/api-gateway/.env` + `apps/api/.env` + `apps/web/.env.local`.

Read your brief fully before coding. Graded against that brief’s Must / Should / Stretch plus [grading](../grading.md), [stack](../stack.md), and [submission](../submission.md).

| #   | Project               | Slug                    | Summary                                     | Brief                               |
| --- | --------------------- | ----------------------- | ------------------------------------------- | ----------------------------------- |
| 1   | Job Portal            | `job-portal`            | Jobs, applications, company/candidate roles | [01](./01-job-portal.md)            |
| 2   | E-commerce            | `ecommerce-marketplace` | Products, cart, checkout, reviews           | [02](./02-ecommerce-marketplace.md) |
| 3   | Project Management    | `project-management`    | Boards, issues, sprints                     | [03](./03-project-management.md)    |
| 4   | LMS                   | `lms`                   | Courses, lessons, quizzes, grades           | [04](./04-lms.md)                   |
| 5   | Hospital Appointments | `hospital-appointments` | Slots, schedules, prescriptions             | [05](./05-hospital-appointments.md) |
| 6   | Expense Split         | `expense-split`         | Shared expenses and balances                | [06](./06-expense-split.md)         |
| 7   | Hotel Booking         | `hotel-booking`         | Rooms, availability, reviews                | [07](./07-hotel-booking.md)         |
| 8   | Food Delivery         | `food-delivery`         | Menus, orders, delivery status              | [08](./08-food-delivery.md)         |
| 9   | CMS / Blogging        | `cms-blogging`          | Drafts, publish, comments                   | [09](./09-cms-blogging.md)          |
| 10  | Inventory             | `inventory-warehouse`   | Stock, warehouses, transfers                | [10](./10-inventory-warehouse.md)   |
| 11  | CRM                   | `crm`                   | Leads, deals, pipeline                      | [11](./11-crm.md)                   |
| 12  | Support Desk          | `support-desk`          | Tickets, agents, SLAs                       | [12](./12-support-desk.md)          |
| 13  | Property Rental       | `property-rental`       | Listings, bookings, leases                  | [13](./13-property-rental.md)       |
| 14  | Event Management      | `event-management`      | Events, RSVPs, check-in                     | [14](./14-event-management.md)      |
| 15  | Fitness Tracker       | `fitness-tracker`       | Workouts, goals, progress                   | [15](./15-fitness-tracker.md)       |
| 16  | Finance Tracker       | `finance-tracker`       | Accounts, budgets, transactions             | [16](./16-finance-tracker.md)       |
| 17  | Library               | `library-management`    | Catalog, borrow, fines                      | [17](./17-library-management.md)    |
