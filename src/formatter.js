/**
 * Format a Discord message into a LINE Flex Message (table-style card).
 *
 * Displays: channel name, author, timestamp, message content, and attachment links.
 */

/**
 * @param {import('discord.js').Message} msg
 * @returns {object} LINE Flex Message object
 */
function formatToFlexMessage(msg) {
  const timestamp = new Date(msg.createdTimestamp).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const channelName = msg.channel.name || 'DM';
  const serverName = msg.guild?.name || 'Direct Message';
  const authorName = msg.author.displayName || msg.author.username;
  const content = msg.content || '(ไม่มีข้อความ)';

  // Build table rows
  const rows = [
    makeTableRow('📍 Server', serverName),
    makeTableRow('💬 Channel', `#${channelName}`),
    makeTableRow('👤 ผู้ส่ง', authorName),
    makeTableRow('⏰ เวลา', timestamp),
  ];

  // Build body contents
  const bodyContents = [
    // Header section
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '🔔 Discord Alert',
          weight: 'bold',
          size: 'lg',
          color: '#5865F2',
        },
      ],
    },
    // Separator
    {
      type: 'separator',
      margin: 'md',
    },
    // Table rows
    ...rows,
    // Separator before content
    {
      type: 'separator',
      margin: 'md',
    },
    // Message content
    {
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: [
        {
          type: 'text',
          text: '📝 เนื้อหา',
          size: 'xs',
          color: '#AAAAAA',
          weight: 'bold',
        },
        {
          type: 'text',
          text: truncate(content, 1000),
          size: 'sm',
          color: '#333333',
          wrap: true,
          margin: 'sm',
        },
      ],
    },
  ];

  // Add attachments if any
  const attachments = msg.attachments;
  if (attachments && attachments.size > 0) {
    bodyContents.push({
      type: 'separator',
      margin: 'md',
    });

    const attachmentTexts = [];
    let index = 1;
    for (const [, att] of attachments) {
      attachmentTexts.push({
        type: 'text',
        text: `${index}. ${att.name || 'file'} (${formatSize(att.size)})`,
        size: 'xs',
        color: '#5865F2',
        wrap: true,
        action: {
          type: 'uri',
          label: 'Open',
          uri: att.url,
        },
      });
      index++;
    }

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: [
        {
          type: 'text',
          text: '📎 ไฟล์แนบ',
          size: 'xs',
          color: '#AAAAAA',
          weight: 'bold',
        },
        ...attachmentTexts,
      ],
    });

    // If first attachment is an image, show preview
    const firstImage = attachments.find((att) =>
      att.contentType?.startsWith('image/')
    );
    if (firstImage) {
      bodyContents.push({
        type: 'image',
        url: firstImage.url,
        size: 'full',
        aspectMode: 'cover',
        aspectRatio: '20:13',
        margin: 'md',
      });
    }
  }

  return {
    type: 'flex',
    altText: `🔔 ${authorName} ใน #${channelName}: ${truncate(content, 100)}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: {
        header: {
          backgroundColor: '#5865F2',
        },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
        paddingAll: '16px',
        backgroundColor: '#FFFFFF',
      },
    },
  };
}

/**
 * Create a table-style row (label + value side by side)
 */
function makeTableRow(label, value) {
  return {
    type: 'box',
    layout: 'horizontal',
    margin: 'md',
    contents: [
      {
        type: 'text',
        text: label,
        size: 'xs',
        color: '#AAAAAA',
        flex: 3,
        weight: 'bold',
      },
      {
        type: 'text',
        text: value,
        size: 'sm',
        color: '#333333',
        flex: 5,
        wrap: true,
      },
    ],
  };
}

/**
 * Truncate text to maxLen characters
 */
function truncate(text, maxLen) {
  if (!text) return '(ว่างเปล่า)';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

/**
 * Format file size in human-readable form
 */
function formatSize(bytes) {
  if (!bytes) return '?';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

module.exports = { formatToFlexMessage };
