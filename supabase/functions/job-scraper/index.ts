
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
    const { userId, jobTitles, locations, h1bOnly, salary, autoApply } = await req.json();

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

    // Log the request with all parameters to understand what's being requested
    console.log('Job Search Request:', {
      userId,
      jobTitles,
      locations, 
      h1bOnly,
      salary,
      autoApply,
      hasResume: !!profile.resume_url
    });

    // Mock job scraping - in a real implementation, this would call external job APIs
    // or use web scraping libraries to find jobs matching the criteria
    const jobSources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Monster'];
    const mockJobs = [];
    
    // Generate 5-15 random jobs, with more if autoApply is true
    const numJobs = autoApply 
      ? Math.floor(Math.random() * 15) + 10 // 10-25 jobs when auto-applying
      : Math.floor(Math.random() * 10) + 5; // 5-15 jobs for normal search
    
    const titles = (jobTitles || ['Software Developer', 'Frontend Engineer', 'React Developer']).split(',');
    const locationList = (locations || ['San Francisco', 'New York', 'Remote']).split(',');
    
    // Helper to get random element from array
    const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Create random jobs with more realistic values
    for (let i = 0; i < numJobs; i++) {
      const randomTitle = getRandomElement(titles).trim();
      const randomLocation = getRandomElement(locationList).trim();
      
      // Generate more realistic company names
      const companyPrefixes = ['Tech', 'Digital', 'Global', 'United', 'Next', 'Cloud', 'Data', 'Cyber', 'Meta'];
      const companyTypes = ['Systems', 'Technologies', 'Solutions', 'Innovations', 'Networks', 'Software', 'Group'];
      const randomCompany = `${getRandomElement(companyPrefixes)}${getRandomElement(companyTypes)}`;
      
      const randomSource = getRandomElement(jobSources);
      
      // If h1bOnly is true, all companies should be H1B sponsors
      // If h1bOnly is false, about 40% of companies should be H1B sponsors
      const randomH1b = h1bOnly ? true : Math.random() < 0.4;
      
      // Apply salary filter if provided
      const jobSalary = Math.floor(Math.random() * 70000) + 80000; // $80k-$150k
      if (salary && jobSalary < salary) {
        continue; // Skip this job if salary is too low
      }
      
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
    // Apply more aggressively if autoApply flag is set
    const applyProbability = autoApply ? 0.8 : 0.7; // 80% vs 70% apply rate
    
    setTimeout(async () => {
      try {
        // Update status to "Applied" for random subset of jobs
        const jobsToUpdate = insertedJobs
          .filter(() => Math.random() < applyProbability)
          .map(job => job.id);
          
        if (jobsToUpdate.length > 0) {
          await supabaseAdmin
            .from('applications')
            .update({ 
              status: 'Applied',
              applied_at: new Date().toISOString()
            })
            .in('id', jobsToUpdate);
            
          console.log(`Auto-applied to ${jobsToUpdate.length} jobs for user ${userId}`);
        }
        
        // For some applications, simulate interview requests (only if autoApply is true)
        if (autoApply) {
          const interviewJobs = insertedJobs
            .filter(() => Math.random() < 0.15) // 15% of jobs lead to interviews
            .map(job => job.id);
            
          if (interviewJobs.length > 0) {
            // Delay interview status updates to simulate realistic timeline
            setTimeout(async () => {
              await supabaseAdmin
                .from('applications')
                .update({ status: 'Interview' })
                .in('id', interviewJobs);
                
              console.log(`Interview requests received for ${interviewJobs.length} jobs`);
            }, 10000); // After 10 seconds
          }
        }
      } catch (e) {
        console.error('Background job application error:', e);
      }
    }, 5000); // Simulate delay in processing
    
    return new Response(
      JSON.stringify({
        message: autoApply 
          ? 'Job hunt and auto-apply initiated successfully' 
          : 'Job search initiated successfully',
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
