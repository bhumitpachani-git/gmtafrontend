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

export function useWizard() {
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = landing, 1-6 = steps
  const [jobStage, setJobStage] = useState(null); // raw job.stage passthrough for step 1

  const [company, setCompany] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [decisionMakers, setDecisionMakers] = useState(null);
  const [emails, setEmails] = useState(null);

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
    try {
      const { jobId } = await startCampaigns(sid);
      const result = await pollJob(jobId);
      setCampaigns(result.campaigns);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(4);
    setCurrentStep(4);
    try {
      const { jobId } = await startCustomers(sid);
      const result = await pollJob(jobId);
      setCustomers(result.customers);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(5);
    setCurrentStep(5);
    try {
      const { jobId } = await startDecisionMakers(sid);
      const result = await pollJob(jobId);
      setDecisionMakers(result.decisionMakers);
    } catch (err) {
      setError(err.message);
      setLoadingStep(null);
      return;
    }
    setLoadingStep(null);

    setLoadingStep(6);
    setCurrentStep(6);
    try {
      const { jobId } = await startEmails(sid);
      const result = await pollJob(jobId);
      setEmails(result.emails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStep(null);
    }
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
    emails,
    runAll,
  };
}
