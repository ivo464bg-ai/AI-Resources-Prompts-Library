import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  { email: 'test2@abv.bg', password: '123456', username: 'Test User 2' },
  { email: 'test3@abv.bg', password: '123456', username: 'Test User 3' },
  { email: 'test4@abv.bg', password: '123456', username: 'Test User 4' },
  { email: 'test5@abv.bg', password: '123456', username: 'Test User 5' }
];

const samplePrompts = [
  {
    title: 'Generate a React Component',
    prompt_text: 'Create a functional React component that displays a user profile card with name, avatar, and bio.',
    result_text: '```jsx\nimport React from "react";\n\nconst UserProfile = ({ name, avatar, bio }) => (\n  <div className="card">\n    <img src={avatar} alt={`${name} avatar`} />\n    <h2>{name}</h2>\n    <p>{bio}</p>\n  </div>\n);\n\nexport default UserProfile;\n```'
  },
  {
    title: 'Explain Quantum Computing',
    prompt_text: 'Explain the basics of quantum computing to a 10-year-old.',
    result_text: 'Imagine a regular computer as a light switch that can only be ON or OFF. A quantum computer is like a dimmer switch that can be ON, OFF, or anywhere in between all at the same time! This allows it to solve certain complex puzzles much faster than a regular computer.'
  }
];

async function seedData() {
  console.log('Starting database seeding...');

  for (const userData of usersToCreate) {
    console.log(`\nProcessing user: ${userData.email}`);
    
    // 1. Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`User ${userData.email} already exists. Skipping creation.`);
        continue;
      } else {
        console.error(`Error creating user ${userData.email}:`, authError.message);
        continue;
      }
    }

    const userId = authData.user.id;
    console.log(`Created user with ID: ${userId}`);

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userId, username: userData.username }]);

    if (profileError) {
      console.error(`Error creating profile for ${userData.email}:`, profileError.message);
    } else {
      console.log(`Created profile for ${userData.email}`);
    }

    // 3. Create 'Demo' category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert([{ user_id: userId, name: 'Demo', description: 'Demo category for sample prompts' }])
      .select()
      .single();

    if (categoryError) {
      console.error(`Error creating category for ${userData.email}:`, categoryError.message);
      continue;
    }

    const categoryId = categoryData.id;
    console.log(`Created 'Demo' category with ID: ${categoryId}`);

    // 4. Insert sample prompts
    const promptsToInsert = samplePrompts.map((prompt, index) => ({
      user_id: userId,
      category_id: categoryId,
      title: `${prompt.title} (${index + 1})`,
      prompt_text: prompt.prompt_text,
      result_text: prompt.result_text
    }));

    const { error: promptsError } = await supabase
      .from('prompts')
      .insert(promptsToInsert);

    if (promptsError) {
      console.error(`Error inserting prompts for ${userData.email}:`, promptsError.message);
    } else {
      console.log(`Inserted 2 sample prompts for ${userData.email}`);
    }
  }

  console.log('\nDatabase seeding completed successfully!');
}

seedData().catch(console.error);
