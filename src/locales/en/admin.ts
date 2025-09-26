import type { Locale } from 'src/utils/i18n';

export const admin: Locale = {
  title: 'Forum Administration',
  description:
    'Manage forum channels and topics. Create new channels, refresh statistics, and organize forum structure.',
  shortcuts: {
    refreshAll: 'Refresh All',
    addChannel: 'Add Channel',
  },
  channels: {
    title: 'Channels',
    addChannel: 'Add Channel',
    refreshAll: 'Refresh All',
    noChannels: {
      title: 'No Channels Found',
      description: 'Create your first channel to get started.',
    },
    loading: 'Loading channels...',
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      refresh: 'Refresh statistics',
    },
    delete: {
      confirm: 'DELETE CHANNEL',
      warning: 'This will permanently delete the channel.',
      details: {
        threads: 'Current threads',
        category: 'Category',
      },
      cannotUndo: 'This action cannot be undone!',
      typeToConfirm: 'Type the channel name to confirm deletion:',
      namePrompt: 'Please type "{name}" to confirm deletion:',
      nameMismatch: 'Channel name does not match. Deletion cancelled.',
      hasThreads:
        'Cannot delete channel with existing threads. Move or delete threads first.',
      success: 'Channel deleted successfully',
      failed: 'Failed to delete channel',
      confirmText: 'Are you sure you want to delete this channel?',
    },
    edit: {
      namePrompt: 'Edit channel name (current: "{current}"):',
      success: 'Channel updated successfully',
      failed: 'Failed to update channel',
    },
    create: {
      success: 'Channel "{name}" created successfully',
      failed: 'Failed to create channel',
    },
    refresh: {
      success: 'Channel statistics refreshed',
      allSuccess: 'All channel statistics refreshed',
      failed: 'Failed to refresh channel statistics',
    },
  },
  topics: {
    moveUp: 'Move topic up',
    moveDown: 'Move topic down',
    delete: 'Delete topic',
    deleteDisabled: 'Cannot delete topic with channels',
  },
  errors: {
    loadFailed: 'Failed to load channels',
    retry: 'Retry',
  },
};
