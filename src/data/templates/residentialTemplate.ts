import type { Task, RequiredFile, StageDocument, TemplateStage } from '@/types'

/**
 * Comprehensive Residential Interior Design Template
 *
 * This template provides a complete workflow for residential interior design projects
 * including apartments, villas, and homes. It covers all 7 stages of the design process
 * with 8-10 tasks per stage, required files, and stage documents.
 */

// Helper function to create dates
const daysFromNow = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const createDate = (daysAgo: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

// ============================================================================
// SALES STAGE TASKS (10 tasks)
// ============================================================================

export const salesTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Initial Client Consultation',
    description: 'Conduct first meeting with client to understand requirements, budget, timeline, and design preferences for their home interior.',
    dueDate: daysFromNow(2),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    checklistItems: [
      { id: 'sl-1-1', label: 'Schedule consultation meeting', completed: true },
      { id: 'sl-1-2', label: 'Prepare questionnaire', completed: true },
      { id: 'sl-1-3', label: 'Record client preferences', completed: true }
    ]
  },
  {
    title: 'Site Survey and Measurement',
    description: 'Visit the residential property to take accurate measurements, assess structural conditions, and photograph existing spaces.',
    dueDate: daysFromNow(5),
    assignee: {
      id: 'sales-2',
      name: 'Michael Chen',
      role: 'Sales Executive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    subtasks: [
      { id: 'st-1-1', label: 'Measure all room dimensions', completed: true, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
      { id: 'st-1-2', label: 'Document ceiling heights', completed: true, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
      { id: 'st-1-3', label: 'Photograph all spaces', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'site-measurements.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Michael Chen'
      }
    ]
  },
  {
    title: 'Budget Estimation and Proposal',
    description: 'Prepare detailed cost estimate for the residential project including design fees, materials, labor, and contingencies.',
    dueDate: daysFromNow(7),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    checklistItems: [
      { id: 'sl-2-1', label: 'Calculate design fee', completed: false },
      { id: 'sl-2-2', label: 'Estimate material costs', completed: false },
      { id: 'sl-2-3', label: 'Include labor and installation', completed: false }
    ]
  },
  {
    title: 'Client Briefing Document',
    description: 'Compile comprehensive brief documenting client lifestyle, family needs, design style preferences, and functional requirements.',
    dueDate: daysFromNow(8),
    assignee: {
      id: 'sales-2',
      name: 'Michael Chen',
      role: 'Sales Executive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    subtasks: [
      { id: 'st-2-1', label: 'Document family composition', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
      { id: 'st-2-2', label: 'Note lifestyle requirements', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
    ]
  },
  {
    title: 'Scope of Work Documentation',
    description: 'Define detailed scope including rooms to be designed, specific services, exclusions, and deliverables for the residential project.',
    dueDate: daysFromNow(9),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales'
  },
  {
    title: 'Contract Negotiation',
    description: 'Finalize terms, payment schedule, timelines, and legal clauses with the client for the interior design agreement.',
    dueDate: daysFromNow(10),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    checklistItems: [
      { id: 'sl-3-1', label: 'Review payment milestones', completed: false },
      { id: 'sl-3-2', label: 'Clarify revision policy', completed: false }
    ]
  },
  {
    title: 'Design Agreement Signing',
    description: 'Execute the formal design services agreement with client signatures and collect initial design deposit payment.',
    dueDate: daysFromNow(12),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    attachments: [
      {
        id: 'att-2',
        name: 'design-agreement-draft.pdf',
        size: '856 KB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(2),
        uploadedBy: 'Sarah Johnson'
      }
    ]
  },
  {
    title: 'Project Handover to Design Team',
    description: 'Transfer all client information, requirements, site data, and contract details to the design team for project initiation.',
    dueDate: daysFromNow(13),
    assignee: {
      id: 'sales-2',
      name: 'Michael Chen',
      role: 'Sales Executive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    subtasks: [
      { id: 'st-3-1', label: 'Compile all client documents', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
      { id: 'st-3-2', label: 'Schedule handover meeting', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
      { id: 'st-3-3', label: 'Introduce design team to client', completed: false, assigneeId: 'sales-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
    ]
  },
  {
    title: 'Timeline and Milestone Planning',
    description: 'Create detailed project timeline with key milestones, design reviews, and installation dates for client approval.',
    dueDate: daysFromNow(14),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales'
  },
  {
    title: 'Client Onboarding Completion',
    description: 'Ensure all onboarding documents are collected, portal access is provided, and client is ready for design phase.',
    dueDate: daysFromNow(15),
    assignee: {
      id: 'sales-2',
      name: 'Michael Chen',
      role: 'Sales Executive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Sales',
    checklistItems: [
      { id: 'sl-4-1', label: 'Collect client ID and address proof', completed: false },
      { id: 'sl-4-2', label: 'Set up project portal access', completed: false },
      { id: 'sl-4-3', label: 'Share design process guide', completed: false }
    ]
  }
]

// ============================================================================
// DESIGN STAGE TASKS (10 tasks)
// ============================================================================

export const designTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Design Concept Development',
    description: 'Create initial design concepts exploring different aesthetic directions, color palettes, and spatial arrangements for the home.',
    dueDate: daysFromNow(18),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    subtasks: [
      { id: 'dt-1-1', label: 'Research design styles', completed: true, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
      { id: 'dt-1-2', label: 'Develop 3 concept directions', completed: true, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
      { id: 'dt-1-3', label: 'Create concept presentation', completed: false, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' }
    ]
  },
  {
    title: 'Mood Board Creation',
    description: 'Develop visual mood boards showing materials, colors, textures, furniture styles, and overall aesthetic for each room.',
    dueDate: daysFromNow(20),
    assignee: {
      id: 'des-2',
      name: 'Liam Parker',
      role: 'Interior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    attachments: [
      {
        id: 'att-3',
        name: 'living-room-moodboard.jpg',
        size: '3.2 MB',
        type: 'image',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Liam Parker'
      },
      {
        id: 'att-4',
        name: 'bedroom-moodboard.jpg',
        size: '2.8 MB',
        type: 'image',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Liam Parker'
      }
    ],
    checklistItems: [
      { id: 'ds-1-1', label: 'Living and dining area', completed: true },
      { id: 'ds-1-2', label: 'Master bedroom suite', completed: true },
      { id: 'ds-1-3', label: 'Kitchen and utility', completed: false }
    ]
  },
  {
    title: 'Color Scheme Finalization',
    description: 'Select and present color palettes for walls, ceilings, and accent areas ensuring harmony throughout the home.',
    dueDate: daysFromNow(22),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design'
  },
  {
    title: 'Space Planning and Layout',
    description: 'Develop functional floor plans showing furniture placement, traffic flow, and spatial organization for all rooms.',
    dueDate: daysFromNow(25),
    assignee: {
      id: 'des-2',
      name: 'Liam Parker',
      role: 'Interior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    subtasks: [
      { id: 'dt-2-1', label: 'Create scaled floor plans', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
      { id: 'dt-2-2', label: 'Plan furniture arrangements', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' }
    ]
  },
  {
    title: 'Furniture Selection and Specification',
    description: 'Select furniture pieces for living, dining, bedroom areas with specifications, dimensions, and product sources.',
    dueDate: daysFromNow(27),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    checklistItems: [
      { id: 'ds-2-1', label: 'Living room seating', completed: false },
      { id: 'ds-2-2', label: 'Dining table and chairs', completed: false },
      { id: 'ds-2-3', label: 'Bedroom furniture', completed: false }
    ]
  },
  {
    title: 'Lighting Design Scheme',
    description: 'Design comprehensive lighting plan including ambient, task, and accent lighting with fixture selections.',
    dueDate: daysFromNow(28),
    assignee: {
      id: 'des-2',
      name: 'Liam Parker',
      role: 'Interior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    subtasks: [
      { id: 'dt-3-1', label: 'Plan ambient lighting', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
      { id: 'dt-3-2', label: 'Select decorative fixtures', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
      { id: 'dt-3-3', label: 'Specify task lighting', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' }
    ]
  },
  {
    title: 'Material and Finishes Selection',
    description: 'Choose flooring, wall finishes, countertops, backsplashes, and other materials with samples for client review.',
    dueDate: daysFromNow(30),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    attachments: [
      {
        id: 'att-5',
        name: 'material-samples.pdf',
        size: '4.1 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(3),
        uploadedBy: 'Emma Wilson'
      }
    ]
  },
  {
    title: '3D Visualization Rendering',
    description: 'Create photorealistic 3D renderings of key spaces to help client visualize the final design outcome.',
    dueDate: daysFromNow(32),
    assignee: {
      id: 'des-2',
      name: 'Liam Parker',
      role: 'Interior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    checklistItems: [
      { id: 'ds-3-1', label: 'Living room views', completed: false },
      { id: 'ds-3-2', label: 'Master bedroom views', completed: false },
      { id: 'ds-3-3', label: 'Kitchen and dining views', completed: false }
    ]
  },
  {
    title: 'Soft Furnishing and Decor Plan',
    description: 'Select curtains, cushions, rugs, artwork, and decorative accessories to complete the interior design.',
    dueDate: daysFromNow(33),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design'
  },
  {
    title: 'Design Presentation to Client',
    description: 'Conduct formal presentation of complete design scheme including layouts, renders, materials, and furniture to client.',
    dueDate: daysFromNow(35),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Design',
    subtasks: [
      { id: 'dt-4-1', label: 'Prepare presentation deck', completed: false, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
      { id: 'dt-4-2', label: 'Schedule client meeting', completed: false, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
      { id: 'dt-4-3', label: 'Collect client feedback', completed: false, assigneeId: 'des-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' }
    ]
  }
]

// ============================================================================
// TECHNICAL DESIGN STAGE TASKS (9 tasks)
// ============================================================================

export const technicalDesignTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Detailed 2D Working Drawings',
    description: 'Prepare comprehensive 2D floor plans, elevations, and sections with accurate dimensions for all spaces.',
    dueDate: daysFromNow(40),
    assignee: {
      id: 'tech-1',
      name: 'David Kumar',
      role: 'Technical Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    subtasks: [
      { id: 'tt-1-1', label: 'Floor plans with dimensions', completed: true, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
      { id: 'tt-1-2', label: 'Elevation drawings', completed: false, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
      { id: 'tt-1-3', label: 'Section drawings', completed: false, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' }
    ]
  },
  {
    title: 'Electrical Layout and Points',
    description: 'Create detailed electrical plans showing switch locations, outlet positions, lighting circuits, and load calculations.',
    dueDate: daysFromNow(42),
    assignee: {
      id: 'tech-2',
      name: 'Rachel Martinez',
      role: 'MEP Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    checklistItems: [
      { id: 'td-1-1', label: 'Light fixture positions', completed: false },
      { id: 'td-1-2', label: 'Switch and dimmer locations', completed: false },
      { id: 'td-1-3', label: 'Power outlet mapping', completed: false }
    ],
    attachments: [
      {
        id: 'att-6',
        name: 'electrical-layout-draft.pdf',
        size: '1.8 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(2),
        uploadedBy: 'Rachel Martinez'
      }
    ]
  },
  {
    title: 'Plumbing and HVAC Layout',
    description: 'Design plumbing connections for kitchen, bathrooms, and HVAC duct routing with specifications.',
    dueDate: daysFromNow(43),
    assignee: {
      id: 'tech-2',
      name: 'Rachel Martinez',
      role: 'MEP Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    subtasks: [
      { id: 'tt-2-1', label: 'Kitchen plumbing plan', completed: false, assigneeId: 'tech-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel' },
      { id: 'tt-2-2', label: 'Bathroom plumbing layout', completed: false, assigneeId: 'tech-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel' }
    ]
  },
  {
    title: 'Custom Millwork Drawings',
    description: 'Prepare detailed shop drawings for custom cabinetry, wardrobes, TV units, and built-in furniture.',
    dueDate: daysFromNow(45),
    assignee: {
      id: 'tech-1',
      name: 'David Kumar',
      role: 'Technical Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    checklistItems: [
      { id: 'td-2-1', label: 'Kitchen cabinets', completed: false },
      { id: 'td-2-2', label: 'Wardrobe units', completed: false },
      { id: 'td-2-3', label: 'TV and entertainment units', completed: false }
    ]
  },
  {
    title: 'Ceiling and Partition Details',
    description: 'Develop ceiling plans showing false ceiling layouts, heights, coffers, and partition construction details.',
    dueDate: daysFromNow(46),
    assignee: {
      id: 'tech-1',
      name: 'David Kumar',
      role: 'Technical Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design'
  },
  {
    title: 'Flooring Layout Plan',
    description: 'Create detailed flooring plans showing material changes, tile patterns, wood plank direction, and transition details.',
    dueDate: daysFromNow(47),
    assignee: {
      id: 'tech-2',
      name: 'Rachel Martinez',
      role: 'MEP Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design'
  },
  {
    title: 'GFC Drawings Preparation',
    description: 'Compile Good for Construction (GFC) drawing set incorporating all design disciplines and consultant inputs.',
    dueDate: daysFromNow(50),
    assignee: {
      id: 'tech-1',
      name: 'David Kumar',
      role: 'Technical Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    subtasks: [
      { id: 'tt-3-1', label: 'Coordinate all drawings', completed: false, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
      { id: 'tt-3-2', label: 'Add annotations and notes', completed: false, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
      { id: 'tt-3-3', label: 'Quality check all sheets', completed: false, assigneeId: 'tech-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' }
    ]
  },
  {
    title: 'Technical Specifications Document',
    description: 'Write detailed specifications for materials, finishes, fixtures, and installation methods for contractors.',
    dueDate: daysFromNow(51),
    assignee: {
      id: 'tech-2',
      name: 'Rachel Martinez',
      role: 'MEP Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    attachments: [
      {
        id: 'att-7',
        name: 'technical-specs-template.pdf',
        size: '980 KB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(4),
        uploadedBy: 'Rachel Martinez'
      }
    ]
  },
  {
    title: 'Construction Drawings Approval',
    description: 'Obtain client and consultant approvals on final construction drawings before releasing to procurement.',
    dueDate: daysFromNow(53),
    assignee: {
      id: 'tech-1',
      name: 'David Kumar',
      role: 'Technical Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Technical Design',
    checklistItems: [
      { id: 'td-3-1', label: 'Client sign-off', completed: false },
      { id: 'td-3-2', label: 'Structural consultant approval', completed: false }
    ]
  }
]

// ============================================================================
// PROCUREMENT STAGE TASKS (10 tasks)
// ============================================================================

export const procurementTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Bill of Materials (BOM) Creation',
    description: 'Compile comprehensive BOM listing all materials, furniture, fixtures, and fittings required for the project.',
    dueDate: daysFromNow(55),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    subtasks: [
      { id: 'pt-1-1', label: 'Extract items from drawings', completed: true, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
      { id: 'pt-1-2', label: 'Add quantities and specifications', completed: true, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
      { id: 'pt-1-3', label: 'Review with design team', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' }
    ],
    attachments: [
      {
        id: 'att-8',
        name: 'BOM-residential-v1.xlsx',
        size: '245 KB',
        type: 'other',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Jennifer Lee'
      }
    ]
  },
  {
    title: 'Vendor Identification and Shortlisting',
    description: 'Research and shortlist reliable vendors for furniture, lighting, materials, and custom fabrication.',
    dueDate: daysFromNow(57),
    assignee: {
      id: 'proc-2',
      name: 'Ahmed Hassan',
      role: 'Procurement Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    checklistItems: [
      { id: 'pr-1-1', label: 'Furniture suppliers', completed: false },
      { id: 'pr-1-2', label: 'Lighting vendors', completed: false },
      { id: 'pr-1-3', label: 'Material suppliers', completed: false }
    ]
  },
  {
    title: 'Request for Quotations (RFQ)',
    description: 'Send detailed RFQs to shortlisted vendors with specifications, quantities, and delivery requirements.',
    dueDate: daysFromNow(60),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    subtasks: [
      { id: 'pt-2-1', label: 'Prepare RFQ documents', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
      { id: 'pt-2-2', label: 'Send to vendors', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' }
    ]
  },
  {
    title: 'Quotation Analysis and Comparison',
    description: 'Evaluate vendor quotations comparing pricing, quality, delivery timelines, and warranty terms.',
    dueDate: daysFromNow(65),
    assignee: {
      id: 'proc-2',
      name: 'Ahmed Hassan',
      role: 'Procurement Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    checklistItems: [
      { id: 'pr-2-1', label: 'Create comparison sheet', completed: false },
      { id: 'pr-2-2', label: 'Check vendor credentials', completed: false }
    ]
  },
  {
    title: 'Material Sample Procurement',
    description: 'Order physical samples of key materials, fabrics, and finishes for final client approval before bulk ordering.',
    dueDate: daysFromNow(67),
    assignee: {
      id: 'proc-2',
      name: 'Ahmed Hassan',
      role: 'Procurement Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    attachments: [
      {
        id: 'att-9',
        name: 'sample-request-log.pdf',
        size: '156 KB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(3),
        uploadedBy: 'Ahmed Hassan'
      }
    ]
  },
  {
    title: 'Vendor Selection and Negotiation',
    description: 'Select best vendors based on evaluation and negotiate final pricing, payment terms, and delivery schedules.',
    dueDate: daysFromNow(68),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    subtasks: [
      { id: 'pt-3-1', label: 'Negotiate pricing', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
      { id: 'pt-3-2', label: 'Finalize payment terms', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
      { id: 'pt-3-3', label: 'Confirm delivery dates', completed: false, assigneeId: 'proc-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' }
    ]
  },
  {
    title: 'Purchase Order Generation',
    description: 'Issue formal purchase orders to selected vendors with detailed specifications and delivery instructions.',
    dueDate: daysFromNow(70),
    assignee: {
      id: 'proc-2',
      name: 'Ahmed Hassan',
      role: 'Procurement Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    checklistItems: [
      { id: 'pr-3-1', label: 'Generate PO documents', completed: false },
      { id: 'pr-3-2', label: 'Obtain internal approvals', completed: false },
      { id: 'pr-3-3', label: 'Send to vendors', completed: false }
    ]
  },
  {
    title: 'Custom Furniture Order Coordination',
    description: 'Coordinate custom furniture fabrication with workshops, providing drawings and monitoring production timelines.',
    dueDate: daysFromNow(72),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement'
  },
  {
    title: 'Delivery Schedule Management',
    description: 'Create and manage detailed delivery schedule ensuring materials arrive in correct sequence for installation.',
    dueDate: daysFromNow(75),
    assignee: {
      id: 'proc-2',
      name: 'Ahmed Hassan',
      role: 'Procurement Specialist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement',
    subtasks: [
      { id: 'pt-4-1', label: 'Coordinate with vendors', completed: false, assigneeId: 'proc-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed' },
      { id: 'pt-4-2', label: 'Plan site storage', completed: false, assigneeId: 'proc-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed' }
    ]
  },
  {
    title: 'Procurement Documentation',
    description: 'Maintain complete records of all POs, invoices, delivery receipts, and vendor correspondence.',
    dueDate: daysFromNow(77),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Procurement'
  }
]

// ============================================================================
// PRODUCTION STAGE TASKS (8 tasks)
// ============================================================================

export const productionTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Custom Cabinetry Manufacturing',
    description: 'Oversee production of custom kitchen cabinets, wardrobes, and built-in storage units as per shop drawings.',
    dueDate: daysFromNow(80),
    assignee: {
      id: 'prod-1',
      name: 'Carlos Rodriguez',
      role: 'Production Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    subtasks: [
      { id: 'prt-1-1', label: 'Kitchen cabinet manufacturing', completed: true, assigneeId: 'prod-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
      { id: 'prt-1-2', label: 'Wardrobe production', completed: false, assigneeId: 'prod-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
      { id: 'prt-1-3', label: 'Living room units', completed: false, assigneeId: 'prod-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' }
    ],
    checklistItems: [
      { id: 'pd-1-1', label: 'Material procurement complete', completed: true },
      { id: 'pd-1-2', label: 'Workshop schedule confirmed', completed: true },
      { id: 'pd-1-3', label: 'Quality standards briefed', completed: true }
    ]
  },
  {
    title: 'Furniture Upholstery Work',
    description: 'Coordinate upholstery work for sofas, chairs, and cushions with selected fabrics and finishes.',
    dueDate: daysFromNow(82),
    assignee: {
      id: 'prod-2',
      name: 'Nina Sharma',
      role: 'Production Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    subtasks: [
      { id: 'prt-2-1', label: 'Fabric cutting and preparation', completed: false, assigneeId: 'prod-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
      { id: 'prt-2-2', label: 'Upholstery assembly', completed: false, assigneeId: 'prod-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' }
    ]
  },
  {
    title: 'Metalwork and Fabrication',
    description: 'Manage metal fabrication for railings, decorative screens, shelving brackets, and custom fixtures.',
    dueDate: daysFromNow(83),
    assignee: {
      id: 'prod-1',
      name: 'Carlos Rodriguez',
      role: 'Production Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    attachments: [
      {
        id: 'att-10',
        name: 'metal-specs.pdf',
        size: '1.2 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(2),
        uploadedBy: 'Carlos Rodriguez'
      }
    ]
  },
  {
    title: 'Quality Control Inspections',
    description: 'Conduct quality checks on manufactured items ensuring compliance with specifications and design standards.',
    dueDate: daysFromNow(85),
    assignee: {
      id: 'prod-2',
      name: 'Nina Sharma',
      role: 'Production Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    checklistItems: [
      { id: 'pd-2-1', label: 'Dimensional accuracy', completed: false },
      { id: 'pd-2-2', label: 'Finish quality', completed: false },
      { id: 'pd-2-3', label: 'Hardware installation', completed: false }
    ]
  },
  {
    title: 'Finishing and Surface Treatment',
    description: 'Apply final finishes including painting, polishing, lamination, and protective coatings on manufactured items.',
    dueDate: daysFromNow(87),
    assignee: {
      id: 'prod-1',
      name: 'Carlos Rodriguez',
      role: 'Production Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production'
  },
  {
    title: 'Production Documentation and Photos',
    description: 'Document production progress with photos and reports for client updates and quality records.',
    dueDate: daysFromNow(88),
    assignee: {
      id: 'prod-2',
      name: 'Nina Sharma',
      role: 'Production Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    attachments: [
      {
        id: 'att-11',
        name: 'production-progress-photos.jpg',
        size: '4.5 MB',
        type: 'image',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Nina Sharma'
      }
    ]
  },
  {
    title: 'Packaging and Protection',
    description: 'Ensure all manufactured items are properly packaged with protective materials for safe transportation.',
    dueDate: daysFromNow(89),
    assignee: {
      id: 'prod-1',
      name: 'Carlos Rodriguez',
      role: 'Production Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    checklistItems: [
      { id: 'pd-3-1', label: 'Foam padding applied', completed: false },
      { id: 'pd-3-2', label: 'Cardboard boxing', completed: false }
    ]
  },
  {
    title: 'Pre-Delivery Inspection',
    description: 'Final inspection and sign-off before dispatching manufactured items to site for installation.',
    dueDate: daysFromNow(90),
    assignee: {
      id: 'prod-2',
      name: 'Nina Sharma',
      role: 'Production Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Production',
    subtasks: [
      { id: 'prt-3-1', label: 'Verify against BOM', completed: false, assigneeId: 'prod-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
      { id: 'prt-3-2', label: 'Check for damages', completed: false, assigneeId: 'prod-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
      { id: 'prt-3-3', label: 'Prepare dispatch documents', completed: false, assigneeId: 'prod-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' }
    ]
  }
]

// ============================================================================
// EXECUTION STAGE TASKS (10 tasks)
// ============================================================================

export const executionTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Site Preparation and Protection',
    description: 'Prepare site for installation including floor protection, access arrangements, and material storage setup.',
    dueDate: daysFromNow(92),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    checklistItems: [
      { id: 'ex-1-1', label: 'Floor protection installed', completed: true },
      { id: 'ex-1-2', label: 'Storage area designated', completed: true },
      { id: 'ex-1-3', label: 'Access routes cleared', completed: false }
    ]
  },
  {
    title: 'Electrical Rough-In Work',
    description: 'Install electrical conduits, junction boxes, and wiring as per electrical layout drawings.',
    dueDate: daysFromNow(95),
    assignee: {
      id: 'exec-2',
      name: 'Priya Patel',
      role: 'MEP Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    subtasks: [
      { id: 'et-1-1', label: 'Conduit installation', completed: false, assigneeId: 'exec-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
      { id: 'et-1-2', label: 'Wiring and connections', completed: false, assigneeId: 'exec-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' }
    ]
  },
  {
    title: 'Plumbing Installation',
    description: 'Install plumbing lines for kitchen, bathrooms, and utility areas including supply and drainage systems.',
    dueDate: daysFromNow(96),
    assignee: {
      id: 'exec-2',
      name: 'Priya Patel',
      role: 'MEP Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    checklistItems: [
      { id: 'ex-2-1', label: 'Water supply lines', completed: false },
      { id: 'ex-2-2', label: 'Drainage connections', completed: false }
    ]
  },
  {
    title: 'False Ceiling Installation',
    description: 'Construct false ceiling framework and install gypsum boards as per ceiling design drawings.',
    dueDate: daysFromNow(98),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    subtasks: [
      { id: 'et-2-1', label: 'Grid framework installation', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'et-2-2', label: 'Gypsum board fixing', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'et-2-3', label: 'Jointing and taping', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' }
    ],
    attachments: [
      {
        id: 'att-12',
        name: 'ceiling-progress.jpg',
        size: '3.1 MB',
        type: 'image',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Marcus Thompson'
      }
    ]
  },
  {
    title: 'Flooring Installation',
    description: 'Install flooring materials including tiles, hardwood, or laminate as per design specifications.',
    dueDate: daysFromNow(100),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    checklistItems: [
      { id: 'ex-3-1', label: 'Surface preparation', completed: false },
      { id: 'ex-3-2', label: 'Material laying', completed: false },
      { id: 'ex-3-3', label: 'Grouting and finishing', completed: false }
    ]
  },
  {
    title: 'Painting and Wall Finishes',
    description: 'Apply paint, wallpaper, and decorative wall finishes to all interior surfaces as per color scheme.',
    dueDate: daysFromNow(103),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution'
  },
  {
    title: 'Custom Furniture Installation',
    description: 'Install manufactured cabinetry, wardrobes, and built-in furniture units ensuring proper fit and finish.',
    dueDate: daysFromNow(105),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    subtasks: [
      { id: 'et-3-1', label: 'Kitchen cabinets', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'et-3-2', label: 'Bedroom wardrobes', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'et-3-3', label: 'Living area units', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' }
    ]
  },
  {
    title: 'Lighting Fixture Installation',
    description: 'Install all lighting fixtures including chandeliers, downlights, wall sconces, and accent lighting.',
    dueDate: daysFromNow(107),
    assignee: {
      id: 'exec-2',
      name: 'Priya Patel',
      role: 'MEP Coordinator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    checklistItems: [
      { id: 'ex-4-1', label: 'Decorative fixtures', completed: false },
      { id: 'ex-4-2', label: 'Recessed lighting', completed: false },
      { id: 'ex-4-3', label: 'Under-cabinet lights', completed: false }
    ]
  },
  {
    title: 'Furniture and Furnishing Placement',
    description: 'Place and arrange all furniture, rugs, curtains, and decorative accessories as per design layout.',
    dueDate: daysFromNow(109),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    subtasks: [
      { id: 'et-4-1', label: 'Furniture delivery coordination', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'et-4-2', label: 'Placement per layout', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' }
    ]
  },
  {
    title: 'Site Cleaning and Touch-ups',
    description: 'Perform thorough cleaning, address minor touch-ups, and ensure site is ready for final inspection.',
    dueDate: daysFromNow(110),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Execution',
    checklistItems: [
      { id: 'ex-5-1', label: 'Deep cleaning all areas', completed: false },
      { id: 'ex-5-2', label: 'Touch-up paint work', completed: false },
      { id: 'ex-5-3', label: 'Remove protection materials', completed: false }
    ]
  }
]

// ============================================================================
// POST INSTALLATION STAGE TASKS (9 tasks)
// ============================================================================

export const postInstallationTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Final Quality Inspection',
    description: 'Conduct comprehensive quality inspection of all completed work against design specifications and standards.',
    dueDate: daysFromNow(112),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    checklistItems: [
      { id: 'pi-1-1', label: 'Finish quality check', completed: false },
      { id: 'pi-1-2', label: 'Functionality testing', completed: false },
      { id: 'pi-1-3', label: 'Alignment and leveling', completed: false }
    ]
  },
  {
    title: 'Snag List Creation',
    description: 'Document all defects, incomplete items, and minor issues requiring rectification before handover.',
    dueDate: daysFromNow(113),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    subtasks: [
      { id: 'pt-1-1', label: 'Room-by-room inspection', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'pt-1-2', label: 'Document with photos', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'pt-1-3', label: 'Prioritize rectifications', completed: false, assigneeId: 'exec-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' }
    ],
    attachments: [
      {
        id: 'att-13',
        name: 'snag-list.pdf',
        size: '1.5 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(1),
        uploadedBy: 'Marcus Thompson'
      }
    ]
  },
  {
    title: 'Snag Item Rectification',
    description: 'Address and resolve all items on the snag list ensuring completion to quality standards.',
    dueDate: daysFromNow(116),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation'
  },
  {
    title: 'Client Walkthrough',
    description: 'Conduct detailed walkthrough with client demonstrating all features and collecting feedback.',
    dueDate: daysFromNow(118),
    assignee: {
      id: 'des-1',
      name: 'Emma Wilson',
      role: 'Lead Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    checklistItems: [
      { id: 'pi-2-1', label: 'Schedule walkthrough', completed: false },
      { id: 'pi-2-2', label: 'Demonstrate features', completed: false },
      { id: 'pi-2-3', label: 'Record client feedback', completed: false }
    ]
  },
  {
    title: 'Professional Photography',
    description: 'Arrange professional photography session to document completed residential interior for portfolio.',
    dueDate: daysFromNow(120),
    assignee: {
      id: 'des-2',
      name: 'Liam Parker',
      role: 'Interior Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    subtasks: [
      { id: 'pt-2-1', label: 'Hire photographer', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
      { id: 'pt-2-2', label: 'Style spaces for shoot', completed: false, assigneeId: 'des-2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' }
    ]
  },
  {
    title: 'Warranty Documentation',
    description: 'Compile and handover warranty certificates for all furniture, fixtures, appliances, and materials.',
    dueDate: daysFromNow(121),
    assignee: {
      id: 'proc-1',
      name: 'Jennifer Lee',
      role: 'Procurement Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    attachments: [
      {
        id: 'att-14',
        name: 'warranty-certificates.pdf',
        size: '2.3 MB',
        type: 'pdf',
        url: '#',
        uploadedAt: createDate(2),
        uploadedBy: 'Jennifer Lee'
      }
    ]
  },
  {
    title: 'Maintenance Guidelines',
    description: 'Prepare and provide care and maintenance instructions for all installed materials and finishes.',
    dueDate: daysFromNow(122),
    assignee: {
      id: 'exec-1',
      name: 'Marcus Thompson',
      role: 'Site Supervisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation'
  },
  {
    title: 'Project Handover Completion',
    description: 'Formal handover of completed project with all documentation, keys, and final sign-off from client.',
    dueDate: daysFromNow(123),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    checklistItems: [
      { id: 'pi-3-1', label: 'All documents compiled', completed: false },
      { id: 'pi-3-2', label: 'Client sign-off obtained', completed: false },
      { id: 'pi-3-3', label: 'Final payment received', completed: false }
    ]
  },
  {
    title: 'Post-Occupancy Follow-up',
    description: 'Schedule follow-up visit after 30 days to ensure client satisfaction and address any concerns.',
    dueDate: daysFromNow(153),
    assignee: {
      id: 'sales-1',
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    status: 'todo',
    priority: 'low',
    stage: 'Post Installation',
    subtasks: [
      { id: 'pt-3-1', label: 'Schedule visit', completed: false, assigneeId: 'sales-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
      { id: 'pt-3-2', label: 'Collect feedback', completed: false, assigneeId: 'sales-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
      { id: 'pt-3-3', label: 'Request testimonial', completed: false, assigneeId: 'sales-1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
    ]
  }
]

// ============================================================================
// REQUIRED FILES BY STAGE
// ============================================================================

export const requiredFiles: Omit<RequiredFile, 'id'>[] = [
  // Sales Stage Files
  { fileName: 'Client Brief and Requirements', uploadDate: daysFromNow(-2), requiredFrom: 'Sales', status: 'received', fileUrl: '#' },
  { fileName: 'Site Measurement Report', uploadDate: daysFromNow(-1), requiredFrom: 'Sales', status: 'received', fileUrl: '#' },
  { fileName: 'Site Photography', uploadDate: daysFromNow(-1), requiredFrom: 'Sales', status: 'received', fileUrl: '#' },
  { fileName: 'Budget Proposal Document', uploadDate: null, requiredFrom: 'Sales', status: 'pending' },
  { fileName: 'Signed Design Agreement', uploadDate: null, requiredFrom: 'Sales', status: 'pending' },
  { fileName: 'Project Timeline', uploadDate: null, requiredFrom: 'Sales', status: 'missing' },
  { fileName: 'Client Contact Information', uploadDate: daysFromNow(-3), requiredFrom: 'Sales', status: 'received', fileUrl: '#' },
  { fileName: 'Scope of Work Document', uploadDate: null, requiredFrom: 'Sales', status: 'pending' },

  // Design Stage Files
  { fileName: 'Design Concept Presentation', uploadDate: daysFromNow(-1), requiredFrom: 'Design', status: 'received', fileUrl: '#' },
  { fileName: 'Mood Boards (All Rooms)', uploadDate: daysFromNow(-1), requiredFrom: 'Design', status: 'received', fileUrl: '#' },
  { fileName: 'Color Scheme Palette', uploadDate: null, requiredFrom: 'Design', status: 'pending' },
  { fileName: '2D Floor Plans', uploadDate: null, requiredFrom: 'Design', status: 'pending' },
  { fileName: 'Furniture Layout Plans', uploadDate: null, requiredFrom: 'Design', status: 'missing' },
  { fileName: '3D Renderings', uploadDate: null, requiredFrom: 'Design', status: 'pending' },
  { fileName: 'Material Specifications', uploadDate: daysFromNow(-3), requiredFrom: 'Design', status: 'received', fileUrl: '#' },
  { fileName: 'Lighting Design Scheme', uploadDate: null, requiredFrom: 'Design', status: 'missing' },

  // Technical Design Stage Files
  { fileName: 'Detailed Working Drawings', uploadDate: null, requiredFrom: 'Technical Design', status: 'pending' },
  { fileName: 'Electrical Layout Plan', uploadDate: null, requiredFrom: 'Technical Design', status: 'pending' },
  { fileName: 'Plumbing and HVAC Layout', uploadDate: null, requiredFrom: 'Technical Design', status: 'missing' },
  { fileName: 'Custom Millwork Shop Drawings', uploadDate: null, requiredFrom: 'Technical Design', status: 'pending' },
  { fileName: 'Ceiling Reflected Plan', uploadDate: null, requiredFrom: 'Technical Design', status: 'missing' },
  { fileName: 'Flooring Layout Plan', uploadDate: null, requiredFrom: 'Technical Design', status: 'missing' },
  { fileName: 'GFC Drawing Set', uploadDate: null, requiredFrom: 'Technical Design', status: 'pending' },
  { fileName: 'Technical Specifications Document', uploadDate: null, requiredFrom: 'Technical Design', status: 'pending' },

  // Procurement Stage Files
  { fileName: 'Bill of Materials (BOM)', uploadDate: daysFromNow(-1), requiredFrom: 'Procurement', status: 'received', fileUrl: '#' },
  { fileName: 'Vendor Quotations', uploadDate: null, requiredFrom: 'Procurement', status: 'pending' },
  { fileName: 'Quotation Comparison Sheet', uploadDate: null, requiredFrom: 'Procurement', status: 'pending' },
  { fileName: 'Purchase Orders', uploadDate: null, requiredFrom: 'Procurement', status: 'missing' },
  { fileName: 'Material Sample Log', uploadDate: null, requiredFrom: 'Procurement', status: 'pending' },
  { fileName: 'Delivery Schedule', uploadDate: null, requiredFrom: 'Procurement', status: 'missing' },
  { fileName: 'Vendor Contact Details', uploadDate: daysFromNow(-2), requiredFrom: 'Procurement', status: 'received', fileUrl: '#' },

  // Production Stage Files
  { fileName: 'Production Schedule', uploadDate: null, requiredFrom: 'Production', status: 'pending' },
  { fileName: 'Quality Control Checklist', uploadDate: null, requiredFrom: 'Production', status: 'pending' },
  { fileName: 'Manufacturing Progress Photos', uploadDate: daysFromNow(-1), requiredFrom: 'Production', status: 'received', fileUrl: '#' },
  { fileName: 'Workshop Drawings Approval', uploadDate: null, requiredFrom: 'Production', status: 'missing' },
  { fileName: 'Material Cutting Lists', uploadDate: null, requiredFrom: 'Production', status: 'pending' },
  { fileName: 'Finishing Specifications', uploadDate: null, requiredFrom: 'Production', status: 'missing' },

  // Execution Stage Files
  { fileName: 'Site Installation Drawings', uploadDate: null, requiredFrom: 'Execution', status: 'pending' },
  { fileName: 'Daily Progress Reports', uploadDate: null, requiredFrom: 'Execution', status: 'pending' },
  { fileName: 'Material Delivery Receipts', uploadDate: null, requiredFrom: 'Execution', status: 'missing' },
  { fileName: 'Site Photos (Progress)', uploadDate: daysFromNow(-1), requiredFrom: 'Execution', status: 'received', fileUrl: '#' },
  { fileName: 'Safety Compliance Certificates', uploadDate: null, requiredFrom: 'Execution', status: 'pending' },
  { fileName: 'As-Built Drawings', uploadDate: null, requiredFrom: 'Execution', status: 'missing' },
  { fileName: 'Labor Attendance Sheets', uploadDate: null, requiredFrom: 'Execution', status: 'pending' },

  // Post Installation Stage Files
  { fileName: 'Snag List Report', uploadDate: null, requiredFrom: 'Post Installation', status: 'pending' },
  { fileName: 'Final Inspection Report', uploadDate: null, requiredFrom: 'Post Installation', status: 'missing' },
  { fileName: 'Warranty Certificates', uploadDate: null, requiredFrom: 'Post Installation', status: 'pending' },
  { fileName: 'Maintenance Guidelines', uploadDate: null, requiredFrom: 'Post Installation', status: 'missing' },
  { fileName: 'Professional Project Photos', uploadDate: null, requiredFrom: 'Post Installation', status: 'missing' },
  { fileName: 'Client Handover Document', uploadDate: null, requiredFrom: 'Post Installation', status: 'pending' },
  { fileName: 'Client Feedback Form', uploadDate: null, requiredFrom: 'Post Installation', status: 'missing' }
]

// ============================================================================
// STAGE DOCUMENTS
// ============================================================================

export const stageDocuments: Omit<StageDocument, 'id'>[] = [
  // Sales Stage Documents
  {
    title: 'Sales Agreement',
    category: 'contract',
    stage: 'Sales',
    status: 'pending',
    uploadDate: null,
    description: 'Formal design services agreement with client',
    requiredForProgression: true
  },
  {
    title: 'Client Onboarding Checklist',
    category: 'checklist',
    stage: 'Sales',
    status: 'uploaded',
    uploadDate: daysFromNow(-2),
    fileUrl: '#',
    description: 'Checklist for client onboarding process'
  },
  {
    title: 'Project Proposal',
    category: 'report',
    stage: 'Sales',
    status: 'approved',
    uploadDate: daysFromNow(-3),
    fileUrl: '#',
    description: 'Detailed project proposal with scope and budget',
    requiredForProgression: true
  },
  {
    title: 'Site Survey Report',
    category: 'report',
    stage: 'Sales',
    status: 'uploaded',
    uploadDate: daysFromNow(-1),
    fileUrl: '#',
    description: 'Comprehensive site measurement and condition report'
  },
  {
    title: 'Payment Schedule',
    category: 'contract',
    stage: 'Sales',
    status: 'pending',
    uploadDate: null,
    description: 'Milestone-based payment schedule'
  },

  // Design Stage Documents
  {
    title: 'Design Presentation',
    category: 'report',
    stage: 'Design',
    status: 'uploaded',
    uploadDate: daysFromNow(-1),
    fileUrl: '#',
    description: 'Complete design concept presentation for client',
    requiredForProgression: true
  },
  {
    title: 'Material Specifications',
    category: 'specification',
    stage: 'Design',
    status: 'uploaded',
    uploadDate: daysFromNow(-3),
    fileUrl: '#',
    description: 'Detailed specifications for all materials and finishes'
  },
  {
    title: 'Furniture Specifications',
    category: 'specification',
    stage: 'Design',
    status: 'pending',
    uploadDate: null,
    description: 'Specifications for all furniture items'
  },
  {
    title: 'Design Approval Form',
    category: 'checklist',
    stage: 'Design',
    status: 'pending',
    uploadDate: null,
    description: 'Client sign-off on final design',
    requiredForProgression: true
  },
  {
    title: 'Design Development Report',
    category: 'report',
    stage: 'Design',
    status: 'pending',
    uploadDate: null,
    description: 'Detailed design development documentation'
  },

  // Technical Design Stage Documents
  {
    title: 'Technical Drawing Set',
    category: 'specification',
    stage: 'Technical Design',
    status: 'pending',
    uploadDate: null,
    description: 'Complete set of construction drawings',
    requiredForProgression: true
  },
  {
    title: 'MEP Coordination Report',
    category: 'report',
    stage: 'Technical Design',
    status: 'pending',
    uploadDate: null,
    description: 'Mechanical, electrical, plumbing coordination report'
  },
  {
    title: 'Technical Specifications',
    category: 'specification',
    stage: 'Technical Design',
    status: 'pending',
    uploadDate: null,
    description: 'Detailed technical specifications for contractors'
  },
  {
    title: 'Drawing Approval Checklist',
    category: 'checklist',
    stage: 'Technical Design',
    status: 'pending',
    uploadDate: null,
    description: 'Checklist for drawing approvals',
    requiredForProgression: true
  },

  // Procurement Stage Documents
  {
    title: 'Procurement Plan',
    category: 'specification',
    stage: 'Procurement',
    status: 'uploaded',
    uploadDate: daysFromNow(-1),
    fileUrl: '#',
    description: 'Detailed procurement strategy and timeline'
  },
  {
    title: 'Vendor Agreements',
    category: 'contract',
    stage: 'Procurement',
    status: 'pending',
    uploadDate: null,
    description: 'Contracts with selected vendors',
    requiredForProgression: true
  },
  {
    title: 'Purchase Order Register',
    category: 'report',
    stage: 'Procurement',
    status: 'pending',
    uploadDate: null,
    description: 'Register of all purchase orders'
  },
  {
    title: 'Quality Assurance Checklist',
    category: 'checklist',
    stage: 'Procurement',
    status: 'pending',
    uploadDate: null,
    description: 'QA checklist for material procurement'
  },
  {
    title: 'Material Sample Approval',
    category: 'report',
    stage: 'Procurement',
    status: 'pending',
    uploadDate: null,
    description: 'Client approval of material samples',
    requiredForProgression: true
  },

  // Production Stage Documents
  {
    title: 'Production Schedule',
    category: 'report',
    stage: 'Production',
    status: 'pending',
    uploadDate: null,
    description: 'Detailed manufacturing timeline'
  },
  {
    title: 'Quality Control Checklist',
    category: 'checklist',
    stage: 'Production',
    status: 'pending',
    uploadDate: null,
    description: 'QC checklist for manufactured items',
    requiredForProgression: true
  },
  {
    title: 'Production Progress Report',
    category: 'report',
    stage: 'Production',
    status: 'uploaded',
    uploadDate: daysFromNow(-1),
    fileUrl: '#',
    description: 'Weekly production progress updates'
  },
  {
    title: 'Workshop Inspection Report',
    category: 'report',
    stage: 'Production',
    status: 'pending',
    uploadDate: null,
    description: 'Workshop inspection and approval report'
  },

  // Execution Stage Documents
  {
    title: 'Site Execution Plan',
    category: 'specification',
    stage: 'Execution',
    status: 'pending',
    uploadDate: null,
    description: 'Detailed site execution strategy'
  },
  {
    title: 'Installation Checklist',
    category: 'checklist',
    stage: 'Execution',
    status: 'pending',
    uploadDate: null,
    description: 'Checklist for installation activities',
    requiredForProgression: true
  },
  {
    title: 'Daily Site Report',
    category: 'report',
    stage: 'Execution',
    status: 'uploaded',
    uploadDate: daysFromNow(-1),
    fileUrl: '#',
    description: 'Daily progress and activity reports'
  },
  {
    title: 'Safety Compliance Certificate',
    category: 'report',
    stage: 'Execution',
    status: 'pending',
    uploadDate: null,
    description: 'Site safety compliance documentation',
    requiredForProgression: true
  },
  {
    title: 'Material Receipt Log',
    category: 'checklist',
    stage: 'Execution',
    status: 'pending',
    uploadDate: null,
    description: 'Log of materials received at site'
  },

  // Post Installation Stage Documents
  {
    title: 'Snag List',
    category: 'checklist',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'List of items requiring rectification'
  },
  {
    title: 'Final Inspection Report',
    category: 'report',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'Final quality inspection report',
    requiredForProgression: true
  },
  {
    title: 'Handover Certificate',
    category: 'contract',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'Official project handover certificate',
    requiredForProgression: true
  },
  {
    title: 'Warranty Documentation',
    category: 'contract',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'Compilation of all warranty certificates'
  },
  {
    title: 'Maintenance Guidelines',
    category: 'specification',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'Care and maintenance instructions'
  },
  {
    title: 'Client Satisfaction Survey',
    category: 'checklist',
    stage: 'Post Installation',
    status: 'pending',
    uploadDate: null,
    description: 'Client feedback and satisfaction survey'
  }
]

// ============================================================================
// STAGE CONFIGURATION
// ============================================================================

export const templateStages: TemplateStage[] = [
  {
    stage: 'Sales',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '14', // Days from project start
    departmentHeadRole: 'Sales Manager',
    notes: 'Initial client engagement and contract finalization'
  },
  {
    stage: 'Design',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '35', // 21 days for design phase
    departmentHeadRole: 'Designer',
    notes: 'Creative design development and client approvals'
  },
  {
    stage: 'Technical Design',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '56', // 21 days for technical design
    departmentHeadRole: 'Technical Designer',
    notes: 'Technical drawings and construction documentation'
  },
  {
    stage: 'Procurement',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '77', // 21 days for procurement
    departmentHeadRole: 'Procurement Manager',
    notes: 'Material sourcing and vendor management'
  },
  {
    stage: 'Production',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '105', // 28 days for production
    departmentHeadRole: 'Production Manager',
    notes: 'Manufacturing and quality control'
  },
  {
    stage: 'Execution',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '140', // 35 days for execution
    departmentHeadRole: 'Site Supervisor',
    notes: 'On-site installation and implementation'
  },
  {
    stage: 'Post Installation',
    status: 'todo',
    priority: 'low',
    startDate: null,
    dueDate: '154', // 14 days for post installation
    departmentHeadRole: 'Project Manager',
    notes: 'Final inspections, handover, and client training'
  }
]

// ============================================================================
// TEMPLATE EXPORT
// ============================================================================

export const residentialTemplate = {
  name: 'Residential Interior Design',
  description: 'Comprehensive template for residential projects including apartments, villas, and homes',
  projectType: 'Residential',
  tasks: {
    Sales: salesTasks,
    Design: designTasks,
    'Technical Design': technicalDesignTasks,
    Procurement: procurementTasks,
    Production: productionTasks,
    Execution: executionTasks,
    'Post Installation': postInstallationTasks
  },
  requiredFiles,
  stageDocuments,
  stages: templateStages
}

export default residentialTemplate
