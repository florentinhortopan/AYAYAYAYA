import { pool } from './connection';

async function seedDatabase() {
  try {
    // Seed initial achievements
    const achievements = [
      {
        name: 'First Steps',
        description: 'Completed your first training program',
        icon: '🎯',
        points: 100
      },
      {
        name: 'Career Explorer',
        description: 'Explored 5 different career paths',
        icon: '🔍',
        points: 150
      },
      {
        name: 'Community Member',
        description: 'Posted your first community message',
        icon: '👥',
        points: 200
      },
      {
        name: 'Fitness Warrior',
        description: 'Completed 10 physical training sessions',
        icon: '💪',
        points: 250
      }
    ];

    for (const achievement of achievements) {
      await pool.query(
        `INSERT INTO achievements (name, description, icon, points)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [achievement.name, achievement.description, achievement.icon, achievement.points]
      );
    }

    // Seed sample career paths
    const careerPaths = [
      {
        name: 'Infantry',
        description: 'Ground combat forces',
        requirements: ['Physical fitness', 'Teamwork', 'Leadership'],
        benefits: ['Combat training', 'Leadership skills', 'Adventure']
      },
      {
        name: 'Engineering',
        description: 'Technical and engineering roles',
        requirements: ['Technical skills', 'Problem solving', 'Education'],
        benefits: ['Technical training', 'Certifications', 'Career opportunities']
      },
      {
        name: 'Medical',
        description: 'Healthcare and medical support',
        requirements: ['Medical knowledge', 'Compassion', 'Education'],
        benefits: ['Medical training', 'Certifications', 'Service to others']
      }
    ];

    for (const path of careerPaths) {
      await pool.query(
        `INSERT INTO career_paths (name, description, requirements, benefits)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [path.name, path.description, JSON.stringify(path.requirements), JSON.stringify(path.benefits)]
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase();

