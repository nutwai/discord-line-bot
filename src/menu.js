/**
 * Create a Flex Message for the Admin Menu.
 */
function createAdminMenu() {
  return {
    type: 'flex',
    altText: '🛠️ Admin Menu',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#2b2d31',
        contents: [
          {
            type: 'text',
            text: '🛠️ Admin Settings',
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '💬 จัดการห้อง Discord',
              data: 'action=manage_channels',
              displayText: 'จัดการห้อง Discord',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '👥 จัดการผู้รับ (Subscribers)',
              data: 'action=manage_subscribers',
              displayText: 'จัดการผู้รับ',
            },
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#5865F2',
            action: {
              type: 'postback',
              label: '📊 ดูสถานะปัจจุบัน',
              data: 'action=view_status',
              displayText: 'ดูสถานะปัจจุบัน',
            },
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'บอทดึงข้อความ Discord → LINE',
            color: '#aaaaaa',
            size: 'xs',
            align: 'center',
          },
        ],
      },
    },
  };
}

/**
 * Menu for managing channels
 */
function createChannelMenu() {
  return {
    type: 'flex',
    altText: 'จัดการห้อง Discord',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: '💬 จัดการห้อง Discord',
            weight: 'bold',
            size: 'md',
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#2ecc71',
            action: {
              type: 'postback',
              label: '➕ เพิ่มห้อง',
              data: 'action=add_channel_prompt',
              displayText: 'ต้องการเพิ่มห้อง',
            },
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#e74c3c',
            action: {
              type: 'postback',
              label: '➖ ลบห้อง',
              data: 'action=remove_channel_prompt',
              displayText: 'ต้องการลบห้อง',
            },
          },
        ],
      },
    },
  };
}

/**
 * Menu for managing subscribers
 */
function createSubscriberMenu() {
  return {
    type: 'flex',
    altText: 'จัดการผู้รับ',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: '👥 จัดการผู้รับแจ้งเตือน',
            weight: 'bold',
            size: 'md',
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#2ecc71',
            action: {
              type: 'postback',
              label: '➕ เพิ่มผู้รับ (U ID / C ID)',
              data: 'action=add_sub_prompt',
              displayText: 'ต้องการเพิ่มผู้รับ',
            },
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#e74c3c',
            action: {
              type: 'postback',
              label: '➖ ลบผู้รับ',
              data: 'action=remove_sub_prompt',
              displayText: 'ต้องการลบผู้รับ',
            },
          },
        ],
      },
    },
  };
}

module.exports = {
  createAdminMenu,
  createChannelMenu,
  createSubscriberMenu,
};
