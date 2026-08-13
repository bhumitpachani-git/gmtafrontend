import { useState, useCallback } from "react";
import {
  pollJob,
  startResearch,
  startCompetitors,
  startCampaigns,
  startCustomers,
  startDecisionMakers,
  startEmails,
} from "../api/pipeline";

const STEP_TITLES = [
  "Research your company",
  "Explore competitors",
  "Define campaigns",
  "Find potential customers",
  "Find decision makers",
  "Write emails",
];

// Auto-running now acts on everything the previous step found instead of a user-picked
// subset, so each expensive fan-out point (customer search per campaign, a website crawl
// per customer) needs its own cap — otherwise a run that used to take a couple of minutes
// with a hand-picked subset can take many times longer processing everything.
const MAX_CAMPAIGNS = 2;
const MAX_CUSTOMERS_PER_CAMPAIGN = 5;
const MAX_CUSTOMERS_FOR_DECISION_MAKERS = 8;
const MAX_PEOPLE_FOR_EMAILS = 10;

export function useWizard() {
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = landing, 1-6 = steps
  const [jobStage, setJobStage] = useState(null); // raw job.stage passthrough for step 1

  const [company, setCompany] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [decisionMakers, setDecisionMakers] = useState(null);
  const [emailPeople, setEmailPeople] = useState(null); // the people step 6 is writing to, known up front
  const [emails, setEmails] = useState(null); // grows one entry at a time as each write finishes

  const [loadingStep, setLoadingStep] = useState(null);
  const [error, setError] = useState(null);

  // Runs every step back-to-back with no manual "Continue" gating in between. Threads
  // the session id through a local variable instead of the `sessionId` state, since
  // state updates aren't visible until the next render — reading it from state here
  // would send the very next request to "/pipeline/undefined/..." and 404.
  const runAll = useCallback(async (url) => {
    setError(null);
    setLoadingStep(1);
    let sid;
    try {
      const { sessionId: newSid, jobId } = await startResearch(url);
      sid = newSid;
      setSessionId(sid);
      setCurrentStep(1);
      const result = await pollJob(jobId, { onTick: (job) => setJobStage(job.stage || null) });
      setCompany(result.company);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(2);
    setCurrentStep(2);
    try {
      const { jobId } = await startCompetitors(sid);
      const result = await pollJob(jobId);
      setCompetitors(result.competitors);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(3);
    setCurrentStep(3);
    let campaignsResult;
    try {
      const { jobId } = await startCampaigns(sid);
      const result = await pollJob(jobId);
      campaignsResult = result.campaigns;
      setCampaigns(campaignsResult);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(4);
    setCurrentStep(4);
    let customersResult;
    try {
      const campaignIndexes = campaignsResult.slice(0, MAX_CAMPAIGNS).map((_, i) => i);
      const { jobId } = await startCustomers(sid, {
        campaignIndexes,
        maxPerCampaign: MAX_CUSTOMERS_PER_CAMPAIGN,
      });
      const result = await pollJob(jobId);
      customersResult = result.customers;
      setCustomers(customersResult);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(5);
    setCurrentStep(5);
    let decisionMakersResult;
    try {
      const customerIndexes = customersResult
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => c.name && !c.error && c.website)
        .slice(0, MAX_CUSTOMERS_FOR_DECISION_MAKERS)
        .map(({ i }) => i);
      const { jobId } = await startDecisionMakers(sid, { customerIndexes });
      const result = await pollJob(jobId);
      decisionMakersResult = result.decisionMakers;
      setDecisionMakers(decisionMakersResult);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(6);
    setCurrentStep(6);
    const personIndexes = decisionMakersResult
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.personName)
      .slice(0, MAX_PEOPLE_FOR_EMAILS)
      .map(({ i }) => i);
    setEmailPeople(personIndexes.map((i) => decisionMakersResult[i]));
    setEmails([]);

    // One person at a time instead of one batch job for everyone: shows the list
    // immediately, fills in each draft as it finishes instead of one long wait, and
    // means a single person's write failing doesn't discard everyone else's.
    for (const idx of personIndexes) {
      try {
        const { jobId } = await startEmails(sid, { personIndexes: [idx] });
        const result = await pollJob(jobId);
        // The backend drops people with neither phone nor email from its result —
        // fall back to a "no contact found" placeholder so this person still gets a row.
        const found = result.emails[0] || {
          personIndex: idx,
          company: decisionMakersResult[idx].company,
          personName: decisionMakersResult[idx].personName,
          personTitle: decisionMakersResult[idx].personTitle,
          personLinkedIn: decisionMakersResult[idx].personLinkedIn || null,
          email: null,
          emailSource: null,
          phone: null,
          outreachEmail: null,
        };
        setEmails((prev) => [...prev, found]);
      } catch (err) {
        setEmails((prev) => [
          ...prev,
          {
            personIndex: idx,
            company: decisionMakersResult[idx].company,
            personName: decisionMakersResult[idx].personName,
            personTitle: decisionMakersResult[idx].personTitle,
            personLinkedIn: decisionMakersResult[idx].personLinkedIn || null,
            email: null,
            emailSource: null,
            phone: null,
            outreachEmail: null,
            error: err.message,
          },
        ]);
      }
    }
    setLoadingStep(null);
  }, []);

  return {
    stepTitles: STEP_TITLES,
    sessionId,
    currentStep,
    jobStage,
    loadingStep,
    error,
    company,
    competitors,
    campaigns,
    customers,
    decisionMakers,
    emailPeople,
    emails,
    runAll,
  };
}
