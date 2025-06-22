import users from '../models/users.js';
import Chapter from '../models/chapter.js';
import Activity from '../models/activity.js';
import UserActivity from '../models/userActivity.js';
import Connection from '../models/connection.js';
import Investment from '../models/investment.js';
import Post from '../models/posts.js';
import Meeting from '../models/meeting.js';
import Event from '../models/Event.js';
import MeetingAttendance from '../models/meetingAttendance.js';
import Membership from '../models/membership.js';
import MembershipHistory from '../models/membershipHistory.js';
import MembershipTier from '../models/MembershipTier.js';
import Notification from '../models/notification.js';
import Comment from '../models/comments.js';
import Referral from '../models/Referral.js';
import Settings from '../models/settings.js';
import Withdrawal from '../models/Withdrawal.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Business from '../models/Business.js';
import ExcelJS from 'exceljs';

function flattenObject(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Buffer.isBuffer(value)) {
      result[key] = value.toString('base64');
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Avoid mongoose Document, ObjectId, etc. being stringified weirdly
      if (value.constructor && value.constructor.name !== 'Object') {
        result[key] = value.toString();
      } else {
        const flat = flattenObject(value);
        for (const subKey in flat) {
          result[`${key}.${subKey}`] = flat[subKey];
        }
      }
    } else if (Array.isArray(value)) {
      result[key] = JSON.stringify(value);
    } else if (typeof value === 'function') {
      // skip functions
    } else if (typeof value === 'object' && value !== null) {
      // fallback for any other object
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const backupDatabase = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const data = {
      users: await users.find({}),
      chapters: await Chapter.find({}),
      activities: await Activity.find({}),
      userActivities: await UserActivity.find({}),
      connections: await Connection.find({}),
      investments: await Investment.find({}),
      posts: await Post.find({}),
      meetings: await Meeting.find({}),
      events: await Event.find({}),
      meetingAttendances: await MeetingAttendance.find({}),
      memberships: await Membership.find({}),
      membershipHistories: await MembershipHistory.find({}),
      membershipTiers: await MembershipTier.find({}),
      notifications: await Notification.find({}),
      comments: await Comment.find({}),
      referrals: await Referral.find({}),
      settings: await Settings.find({}),
      withdrawals: await Withdrawal.find({}),
      withdrawalRequests: await WithdrawalRequest.find({}),
      businesses: await Business.find({}),
    };

    let fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    let contentType = 'application/json';
    let fileBuffer;

    if (format === 'excel') {
      // Excel format: flatten objects, stringify arrays/objects
      const workbook = new ExcelJS.Workbook();
      for (const [key, value] of Object.entries(data)) {
        const sheet = workbook.addWorksheet(key);
        if (value.length > 0) {
          // Flatten all rows, catch errors per row
          const flatRows = value.map(item => {
            try {
              return flattenObject(item.toObject ? item.toObject() : item);
            } catch (e) {
              return { error: 'Could not flatten row', details: e.message };
            }
          });
          sheet.columns = Object.keys(flatRows[0]).map(col => ({ header: col, key: col }));
          flatRows.forEach(row => {
            sheet.addRow(row);
          });
        }
      }
      fileBuffer = await workbook.xlsx.writeBuffer();
      fileName += '.xlsx';
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (format === 'text') {
      // Human-readable text format
      let textContent = '';
      for (const [key, value] of Object.entries(data)) {
        textContent += `===== ${key.toUpperCase()} (${value.length}) =====\n`;
        value.forEach((item, idx) => {
          textContent += `#${idx + 1}:\n`;
          const obj = item.toObject ? item.toObject() : item;
          for (const [k, v] of Object.entries(obj)) {
            textContent += `  ${k}: ${typeof v === 'object' ? JSON.stringify(v, null, 2) : v}\n`;
          }
          textContent += '\n';
        });
        textContent += '\n';
      }
      fileBuffer = Buffer.from(textContent, 'utf-8');
      fileName += '.txt';
      contentType = 'text/plain';
    } else if (format === 'seeder') {
      // Seeder.js file
      let seederContent = `import mongoose from \"mongoose\";\nimport dotenv from \"dotenv\";\nimport connectDB from \"../config/db.js\";\n`;
      seederContent += `import users from \"../models/users.js\";\nimport Post from \"../models/posts.js\";\nimport Comment from \"../models/comments.js\";\nimport MembershipTier from \"../models/MembershipTier.js\";\n// ... import other models as needed\n`;
      seederContent += `\ndotenv.config();\n\nconst seedData = async () => {\n  try {\n    await connectDB();\n`;
      for (const [key, value] of Object.entries(data)) {
        seederContent += `    // Seed for ${key}\n`;
        seederContent += `    await mongoose.connection.collection(\"${key}\").deleteMany({});\n`;
        if (value.length > 0) {
          seederContent += `    await mongoose.connection.collection(\"${key}\").insertMany(${JSON.stringify(value, null, 2)});\n`;
        }
      }
      seederContent += `    console.log(\"\u2705 Data Seeded Successfully!\");\n  } catch (err) {\n    console.log(\"\u274c Error in inserting data: ", err);\n  } finally {\n    mongoose.connection.close();\n    process.exit();\n  }\n};\n\nseedData();\n`;
      fileBuffer = Buffer.from(seederContent, 'utf-8');
      fileName += '.seeder.js';
      contentType = 'application/javascript';
    } else {
      // Default: JSON
      fileBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
      fileName += '.json';
      contentType = 'application/json';
    }

    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', contentType);
    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Failed to create backup', error: error.message });
  }
}; 