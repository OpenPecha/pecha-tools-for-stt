import prisma from '../service/db'
import axios from 'axios'

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const THRESHOLD = 4

export async function checkTranscribingCount() {
  try {
    const taskTranscribingCount = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            tasks: {
              where: {
                state: "transcribing",
                NOT: {
                  transcriber_id: null
                }
              }
            }
          }
        }
      }
    });

    const alerts = taskTranscribingCount
      .filter(group => group._count.tasks < THRESHOLD)
      .map(group => ({
        groupName: group.name,
        taskCount: group._count.tasks,
      }));

    console.log('Alerts to be sent:', alerts);

    if (alerts.length > 0) {
      for (const { groupName, taskCount } of alerts) {
        try {
          await sendDiscordAlert(groupName, taskCount);
          console.log(`Alert sent successfully for group ${groupName}`);
        } catch (error) {
          console.error(`Failed to send alert for ${groupName}:`, error.message);
        }
      }
    }

    return { message: 'Check completed', alerts };
  } catch (error) {
    console.error('Error checking transcribing count:', error);
    throw error;
  }
}

async function sendDiscordAlert(groupName, taskCount) {
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('Discord webhook URL not configured');
  }

  const message = {
    content: `⚠️ Alert: Group "${groupName}" has only ${taskCount} tasks in transcribing state, which is below the threshold of ${THRESHOLD}.`
  };

  console.log('Sending Discord message:', message);

  try {
    const response = await axios({
      method: 'POST',
      url: DISCORD_WEBHOOK_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: message,
      timeout: 5000 
    });

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    console.log('Discord message sent successfully');
    return response;
  } catch (error) {
    if (error.response) {
      console.error('Discord API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(`Discord API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received from Discord');
      throw new Error('No response received from Discord');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      throw error;
    }
  }
}