export const sendAbuseAlert = async (ip: string) => {
  const webhookUrl = 'https://discord.com/api/webhooks/1401937316208972030/wMPXMEoNeoU3c7y_RbndqFD15N2tQkokyFpw3eTy2GfBbskcUytNUR5FDxfEGpt6JZ1Z';

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
