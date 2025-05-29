
export const apiEndpoints = [
  // Authentication Endpoints
  {
    method: 'POST',
    path: '/api/auth/login',
    title: 'User Login',
    description: 'Authenticate a user and receive an access token',
    category: 'authentication',
    requestBody: {
      contentType: 'application/json',
      schema: {
        username: 'string',
        password: 'string'
      }
    },
    responses: {
      '200': {
        description: 'Login successful',
        content: {
          access_token: 'string',
          token_type: 'Bearer',
          expires_in: 3600,
          user: {
            id: 'integer',
            username: 'string',
            email: 'string',
            role: 'admin | resident',
            first_name: 'string',
            last_name: 'string'
          }
        }
      },
      '401': {
        description: 'Invalid credentials'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    title: 'User Logout',
    description: 'Invalidate the current user session',
    category: 'authentication',
    responses: {
      '200': {
        description: 'Logout successful'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/auth/user',
    title: 'Get Current User',
    description: 'Retrieve details of the authenticated user',
    category: 'authentication',
    responses: {
      '200': {
        description: 'User details retrieved successfully',
        content: {
          id: 'integer',
          username: 'string',
          email: 'string',
          role: 'admin | resident',
          first_name: 'string',
          last_name: 'string',
          apartment_number: 'string',
          phone_number: 'string',
          created_at: 'datetime'
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  
  // Residents Endpoints
  {
    method: 'GET',
    path: '/api/residents',
    title: 'List Residents',
    description: 'Retrieve a paginated list of all residents',
    category: 'residents',
    queryParams: [
      {
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: 'integer'
      },
      {
        name: 'limit',
        required: false,
        description: 'Number of records per page',
        type: 'integer'
      },
      {
        name: 'search',
        required: false,
        description: 'Search term to filter results',
        type: 'string'
      }
    ],
    responses: {
      '200': {
        description: 'List of residents',
        content: {
          count: 'integer',
          next: 'string | null',
          previous: 'string | null',
          results: [
            {
              id: 'integer',
              first_name: 'string',
              last_name: 'string',
              email: 'string',
              phone_number: 'string',
              apartment_number: 'string',
              is_owner: 'boolean',
              move_in_date: 'date',
              status: 'active | inactive'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/residents',
    title: 'Create Resident',
    description: 'Add a new resident to the system',
    category: 'residents',
    requestBody: {
      contentType: 'application/json',
      schema: {
        first_name: 'string',
        last_name: 'string',
        email: 'string',
        phone_number: 'string',
        apartment_number: 'string',
        is_owner: 'boolean',
        move_in_date: 'date',
        password: 'string'
      }
    },
    responses: {
      '201': {
        description: 'Resident created successfully',
        content: {
          id: 'integer',
          first_name: 'string',
          last_name: 'string',
          email: 'string',
          phone_number: 'string',
          apartment_number: 'string',
          is_owner: 'boolean',
          move_in_date: 'date',
          status: 'active'
        }
      },
      '400': {
        description: 'Invalid input'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/residents/{id}',
    title: 'Get Resident',
    description: 'Retrieve details of a specific resident',
    category: 'residents',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Resident ID',
        type: 'integer'
      }
    ],
    responses: {
      '200': {
        description: 'Resident details',
        content: {
          id: 'integer',
          first_name: 'string',
          last_name: 'string',
          email: 'string',
          phone_number: 'string',
          apartment_number: 'string',
          is_owner: 'boolean',
          move_in_date: 'date',
          status: 'active | inactive'
        }
      },
      '404': {
        description: 'Resident not found'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  
  // Billing Endpoints
  {
    method: 'GET',
    path: '/api/bills',
    title: 'List Bills',
    description: 'Retrieve a list of bills with optional filtering',
    category: 'billing',
    queryParams: [
      {
        name: 'status',
        required: false,
        description: 'Filter bills by status',
        type: 'string (paid | pending)'
      },
      {
        name: 'resident_id',
        required: false,
        description: 'Filter bills by resident ID',
        type: 'integer'
      },
      {
        name: 'month',
        required: false,
        description: 'Filter bills by month',
        type: 'string (YYYY-MM)'
      }
    ],
    responses: {
      '200': {
        description: 'List of bills',
        content: {
          count: 'integer',
          results: [
            {
              id: 'string',
              type: 'string',
              amount: 'decimal',
              due_date: 'date',
              paid_date: 'date | null',
              status: 'paid | pending',
              resident_id: 'integer',
              description: 'string',
              created_at: 'datetime'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/bills',
    title: 'Create Bill',
    description: 'Generate a new bill for a resident or all residents',
    category: 'billing',
    requestBody: {
      contentType: 'application/json',
      schema: {
        type: 'string',
        amount: 'decimal',
        due_date: 'date',
        resident_id: 'integer | null (null for all residents)',
        description: 'string'
      }
    },
    responses: {
      '201': {
        description: 'Bill(s) created successfully',
        content: {
          message: 'string',
          bill_count: 'integer',
          bill_ids: ['string']
        }
      },
      '400': {
        description: 'Invalid input'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/bills/{id}/pay',
    title: 'Mark Bill as Paid',
    description: 'Update a bill status to paid',
    category: 'billing',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Bill ID',
        type: 'string'
      }
    ],
    responses: {
      '200': {
        description: 'Bill marked as paid',
        content: {
          id: 'string',
          status: 'paid',
          paid_date: 'date'
        }
      },
      '404': {
        description: 'Bill not found'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/bills/{id}/invoice',
    title: 'Download Invoice',
    description: 'Generate and download a PDF invoice for a bill',
    category: 'billing',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Bill ID',
        type: 'string'
      }
    ],
    responses: {
      '200': {
        description: 'PDF invoice file',
      },
      '404': {
        description: 'Bill not found'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  
  // Complaints Endpoints
  {
    method: 'GET',
    path: '/api/complaints',
    title: 'List Complaints',
    description: 'Retrieve a list of complaints with optional filtering',
    category: 'complaints',
    queryParams: [
      {
        name: 'status',
        required: false,
        description: 'Filter by status',
        type: 'string (open | in_progress | resolved | closed)'
      },
      {
        name: 'resident_id',
        required: false,
        description: 'Filter by resident ID',
        type: 'integer'
      }
    ],
    responses: {
      '200': {
        description: 'List of complaints',
        content: {
          count: 'integer',
          results: [
            {
              id: 'integer',
              title: 'string',
              description: 'string',
              status: 'open | in_progress | resolved | closed',
              priority: 'low | medium | high',
              resident_id: 'integer',
              resident_name: 'string',
              assigned_to: 'integer | null',
              created_at: 'datetime',
              updated_at: 'datetime'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/complaints',
    title: 'Submit Complaint',
    description: 'Submit a new complaint',
    category: 'complaints',
    requestBody: {
      contentType: 'application/json',
      schema: {
        title: 'string',
        description: 'string',
        priority: 'low | medium | high',
        images: ['string (base64)'] // Optional
      }
    },
    responses: {
      '201': {
        description: 'Complaint submitted successfully',
        content: {
          id: 'integer',
          title: 'string',
          description: 'string',
          status: 'open',
          priority: 'low | medium | high',
          created_at: 'datetime'
        }
      },
      '400': {
        description: 'Invalid input'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/complaints/{id}/status',
    title: 'Update Complaint Status',
    description: 'Update the status of a complaint',
    category: 'complaints',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Complaint ID',
        type: 'integer'
      }
    ],
    requestBody: {
      contentType: 'application/json',
      schema: {
        status: 'open | in_progress | resolved | closed',
        comment: 'string'
      }
    },
    responses: {
      '200': {
        description: 'Status updated successfully',
        content: {
          id: 'integer',
          status: 'string',
          updated_at: 'datetime'
        }
      },
      '400': {
        description: 'Invalid input'
      },
      '404': {
        description: 'Complaint not found'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  
  // Document Endpoints
  {
    method: 'GET',
    path: '/api/documents',
    title: 'List Documents',
    description: 'Retrieve a list of shared documents',
    category: 'documents',
    queryParams: [
      {
        name: 'category',
        required: false,
        description: 'Filter by document category',
        type: 'string'
      },
      {
        name: 'search',
        required: false,
        description: 'Search term to filter results',
        type: 'string'
      }
    ],
    responses: {
      '200': {
        description: 'List of documents',
        content: {
          count: 'integer',
          results: [
            {
              id: 'integer',
              title: 'string',
              description: 'string',
              file_name: 'string',
              file_size: 'integer',
              file_type: 'string',
              category: 'string',
              uploaded_by: 'integer',
              uploaded_by_name: 'string',
              is_public: 'boolean',
              created_at: 'datetime'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/documents',
    title: 'Upload Document',
    description: 'Upload a new document to the system',
    category: 'documents',
    requestBody: {
      contentType: 'multipart/form-data',
      schema: {
        title: 'string',
        description: 'string',
        category: 'string',
        file: 'file',
        is_public: 'boolean'
      }
    },
    responses: {
      '201': {
        description: 'Document uploaded successfully',
        content: {
          id: 'integer',
          title: 'string',
          file_name: 'string',
          file_url: 'string',
          created_at: 'datetime'
        }
      },
      '400': {
        description: 'Invalid input or file type'
      },
      '401': {
        description: 'Unauthorized'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/documents/{id}',
    title: 'Download Document',
    description: 'Download a specific document',
    category: 'documents',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Document ID',
        type: 'integer'
      }
    ],
    responses: {
      '200': {
        description: 'Document file stream'
      },
      '404': {
        description: 'Document not found'
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Permission denied'
      }
    }
  },
  
  // Staff Endpoints
  {
    method: 'GET',
    path: '/api/staff',
    title: 'List Staff',
    description: 'Retrieve a list of all maintenance staff',
    category: 'staff',
    responses: {
      '200': {
        description: 'List of staff members',
        content: {
          count: 'integer',
          results: [
            {
              id: 'integer',
              first_name: 'string',
              last_name: 'string',
              role: 'string',
              phone_number: 'string',
              email: 'string',
              status: 'active | inactive',
              salary: 'decimal',
              join_date: 'date'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Permission denied'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/staff',
    title: 'Add Staff Member',
    description: 'Add a new maintenance staff member',
    category: 'staff',
    requestBody: {
      contentType: 'application/json',
      schema: {
        first_name: 'string',
        last_name: 'string',
        role: 'string',
        phone_number: 'string',
        email: 'string',
        salary: 'decimal',
        join_date: 'date'
      }
    },
    responses: {
      '201': {
        description: 'Staff member added successfully',
        content: {
          id: 'integer',
          first_name: 'string',
          last_name: 'string',
          role: 'string',
          status: 'active'
        }
      },
      '400': {
        description: 'Invalid input'
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Permission denied'
      }
    }
  },
  {
    method: 'DELETE',
    path: '/api/staff/{id}',
    title: 'Remove Staff Member',
    description: 'Remove a staff member from the system',
    category: 'staff',
    queryParams: [
      {
        name: 'id',
        required: true,
        description: 'Staff member ID',
        type: 'integer'
      }
    ],
    responses: {
      '204': {
        description: 'Staff member removed successfully'
      },
      '404': {
        description: 'Staff member not found'
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Permission denied'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/staff/payment-history',
    title: 'Staff Payment History',
    description: 'Retrieve payment history for all staff members',
    category: 'staff',
    queryParams: [
      {
        name: 'month',
        required: false,
        description: 'Filter by month',
        type: 'string (YYYY-MM)'
      },
      {
        name: 'staff_id',
        required: false,
        description: 'Filter by staff member ID',
        type: 'integer'
      }
    ],
    responses: {
      '200': {
        description: 'Payment history',
        content: {
          count: 'integer',
          results: [
            {
              id: 'integer',
              staff_id: 'integer',
              staff_name: 'string',
              role: 'string',
              amount: 'decimal',
              payment_date: 'date',
              payment_method: 'string',
              status: 'paid | pending',
              month: 'string (YYYY-MM)'
            }
          ]
        }
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Permission denied'
      }
    }
  }
];
