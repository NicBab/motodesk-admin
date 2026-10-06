//************************************************************** */

export type PlatformDateRangeInput = {
  // UTC calendar dates: YYYY-MM-DD.
  // from is inclusive; before is exclusive.
  from: string;
  before: string;
};

//************************************************************** */

export type PlatformDateRange = PlatformDateRangeInput & {
  timezone: "UTC";
};

//************************************************************** */

// These values are unavailable until billing is implemented.
// Null must not be displayed as zero revenue or zero subscriptions.
export type PlatformBillingUnavailable = {
  status: "NOT_CONFIGURED";
  provider: null;

  activeSubscriptions: null;
  trialingSubscriptions: null;
  pastDueSubscriptions: null;

  monthlyRecurringRevenue: null;
  collectedPayments: null;
  failedPayments: null;
  currency: null;

  message: string;
};

//************************************************************** */

export type PlatformOverview = {
  generatedAt: string;
  range: PlatformDateRange;

  organizations: {
    total: number;
    active: number;
    archived: number;
    newInRange: number;
  };

  users: {
    total: number;
    enabled: number;
    verified: number;
    newInRange: number;
  };

  memberships: {
    active: number;
  };

  billing: PlatformBillingUnavailable;
};

//************************************************************** */

export type PlatformGrowthPoint = {
  date: string;

  newOrganizations: number;
  newUsers: number;

  cumulativeOrganizations: number;
  cumulativeUsers: number;
};

//************************************************************** */

export type PlatformGrowth = {
  generatedAt: string;
  range: PlatformDateRange;

  interval: "DAY";
  basis: "RETAINED_REGISTRATIONS";
  description: string;

  points: PlatformGrowthPoint[];
};

//************************************************************** */

export type PlatformDashboardData = {
  overview: PlatformOverview;
  growth: PlatformGrowth;
};

//************************************************************** */