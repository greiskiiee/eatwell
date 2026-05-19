export type ApprovalApplication = {
  userId: string;
  email: string;
  name: string;
  credentials: string;
  certificateUrl: string;
  approvalStatus: string;
  rejectionReason?: string;
  createdAt?: string;
};

export type AdminStats = {
  users: {
    total: number;
    regular: number;
    technologists: number;
    admins: number;
  };
  applications: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recipes: {
    total: number;
    published: number;
    drafts: number;
  };
  engagement: {
    comments: number;
    savedRecipes: number;
  };
  ingredients: {
    total: number;
    untranslated: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  }[];
  recentApplications: {
    userId: string;
    email: string;
    name: string;
    credentials: string;
    createdAt?: string;
  }[];
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  createdAt?: string;
};
