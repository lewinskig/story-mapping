import { PLANNED_RELEASE_ID } from '../constants'

export const defaultStoryMap = {
  releases: [
    { id: PLANNED_RELEASE_ID, name: 'Planned', dueDate: '', system: true },
    { id: 'rmvp', name: 'MVP', dueDate: '2026-08-01', system: false },
    { id: 'r2nd', name: 'Release 2', dueDate: '', system: false },
  ],
  goals: [
    {
      id: 'gord',
      name: 'Order Food',
      color: 'sky',
      steps: [
        {
          id: 'ebrs',
          name: 'Browse restaurants',
          stories: [
            { id: 'svrl', name: 'View restaurant list', priority: 'high', releaseId: PLANNED_RELEASE_ID },
          ],
        },
        {
          id: 'esel',
          name: 'Select food items',
          stories: [
            { id: 'sbmc', name: 'Browse menu categories', priority: 'high', releaseId: PLANNED_RELEASE_ID },
            { id: 'scfi', name: 'Customize food item', priority: 'low', releaseId: 'r2nd' },
          ],
        },
        {
          id: 'eord',
          name: 'Place order',
          stories: [
            { id: 'sait', name: 'Add items to cart', priority: 'medium', releaseId: 'rmvp' },
          ],
        },
      ],
    },
    {
      id: 'gtrk',
      name: 'Track Order',
      color: 'mint',
      steps: [
        {
          id: 'evos',
          name: 'View order status',
          stories: [
            { id: 'strt', name: 'Track order in real time', priority: 'high', releaseId: 'rmvp' },
            { id: 'srdn', name: 'Receive delivery notifications', priority: 'medium', releaseId: 'r2nd' },
          ],
        },
        {
          id: 'evoh',
          name: 'View order history',
          stories: [],
        },
      ],
    },
    {
      id: 'gsup',
      name: 'Support Customer',
      color: 'peach',
      steps: [
        {
          id: 'econ',
          name: 'Contact support',
          stories: [
            { id: 'sacd', name: 'Access contact details', priority: 'medium', releaseId: 'rmvp' },
          ],
        },
        {
          id: 'efdb',
          name: 'Provide feedback',
          stories: [
            { id: 'ssfs', name: 'Submit feedback or suggestions', priority: 'low', releaseId: PLANNED_RELEASE_ID },
          ],
        },
      ],
    },
  ],
}
