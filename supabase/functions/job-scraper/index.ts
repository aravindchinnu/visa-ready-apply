
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Define required headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle options requests for CORS
function handleOptionsRequest() {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Get request data
    const { userId, jobTitles, locations, h1bOnly } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile to check if resume exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('resume_url')
      .eq('id', userId)
      .single();

    if (profileError || !profile.resume_url) {
      return new Response(
        JSON.stringify({ error: 'User resume not found. Please upload a resume first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Mock job scraping - in a real implementation, this would call external job APIs
    // or use web scraping libraries to find jobs matching the criteria
    const jobSources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Monster'];
    const mockJobs = [];
    
    // Generate 5-15 random jobs
    const numJobs = Math.floor(Math.random() * 10) + 5;
    
    const titles = (jobTitles || ['Software Developer', 'Frontend Engineer', 'React Developer']).split(',');
    const locationList = (locations || ['San Francisco', 'New York', 'Remote']).split(',');
    
    for (let i = 0; i < numJobs; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)].trim();
      const randomLocation = locationList[Math.floor(Math.random() * locationList.length)].trim();
      const randomCompany = `Company ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      const randomSource = jobSources[Math.floor(Math.random() * jobSources.length)];
      const randomH1b = h1bOnly ? true : Math.random() > 0.5;
      
      mockJobs.push({
        job_title: randomTitle,
        company_name: randomCompany,
        job_url: `https://example.com/job/${i}`,
        h1b_status: randomH1b,
        status: 'pending',
        user_id: userId
      });
    }
    
    // Insert the jobs into the applications table
    const { data: insertedJobs, error: insertError } = await supabaseAdmin
      .from('applications')
      .insert(mockJobs)
      .select();
      
    if (insertError) {
      console.error('Error inserting jobs:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save job applications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Start the "auto application" process for each job
    // In a real implementation, this would be a separate function or queue
    setTimeout(async () => {
      try {
        // Update status to "Applied" for random subset of jobs
        const jobsToUpdate = insertedJobs
          .filter(() => Math.random() > 0.3) // 70% of jobs get applied to
          .map(job => job.id);
          
        if (jobsToUpdate.length > 0) {
          await supabaseAdmin
            .from('applications')
            .update({ status: 'Applied' })
            .in('id', jobsToUpdate);
        }
      } catch (e) {
        console.error('Background job application error:', e);
      }
    }, 5000); // Simulate delay in processing
    
    return new Response(
      JSON.stringify({
        message: 'Job search initiated successfully',
        jobsFound: mockJobs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in job-scraper function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
