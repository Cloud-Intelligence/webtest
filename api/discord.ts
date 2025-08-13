export const sendAbuseAlert = async (ip: string, webhookUrl: string) => {
  if (!webhookUrl) return;

  const embed = {
    title: 'Rate Limit Warning',
    color: 0xff0000,
    fields: [
      { name: 'IP Address', value: ip, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `Possible abuse detected.`,
        embeds: [embed],
      }),
    });
  } catch (e) {
    console.error('Failed to send abuse alert to Discord:', e);
  }
};
