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

  const runResearch = useCallback(async (url) => {
    setError(null);
    setLoadingStep(1);
    try {
      const { sessionId: sid, jobId } = await startResearch(url);
      setSessionId(sid);
      setCurrentStep(1);
      const result = await pollJob(jobId, { onTick: (job) => setJobStage(job.stage || null) });
      setCompany(result.company);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoadingStep(null);
    }
  }, []);

  const runCompetitors = useCallback(async () => {
    setError(null);
    setLoadingStep(2);
    setCurrentStep(2);
    try {
      const { jobId } = await startCompetitors(sessionId);
      const result = await pollJob(jobId);
      setCompetitors(result.competitors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStep(null);
    }
  }, [sessionId]);

  const runCampaigns = useCallback(async () => {
    setError(null);
    setLoadingStep(3);
    setCurrentStep(3);
    try {
      const { jobId } = await startCampaigns(sessionId);
      const result = await pollJob(jobId);
      setCampaigns(result.campaigns);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStep(null);
    }
  }, [sessionId]);

  const runCustomers = useCallback(
    async (opts) => {
      setError(null);
      setLoadingStep(4);
      setCurrentStep(4);
      try {
        const { jobId } = await startCustomers(sessionId, opts);
        const result = await pollJob(jobId);
        setCustomers(result.customers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStep(null);
      }
    },
    [sessionId]
  );

  const runDecisionMakers = useCallback(
    async (opts) => {
      setError(null);
      setLoadingStep(5);
      setCurrentStep(5);
      try {
        const { jobId } = await startDecisionMakers(sessionId, opts);
        const result = await pollJob(jobId);
        setDecisionMakers(result.decisionMakers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStep(null);
      }
    },
    [sessionId]
  );

  const runEmails = useCallback(
    async (opts) => {
      setError(null);
      setLoadingStep(6);
      setCurrentStep(6);
      try {
        const { jobId } = await startEmails(sessionId, opts);
        const result = await pollJob(jobId);
        setEmails(result.emails);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStep(null);
      }
    },
    [sessionId]
  );

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
    runResearch,
    runCompetitors,
    runCampaigns,
    runCustomers,
    runDecisionMakers,
    runEmails,
  };
}
