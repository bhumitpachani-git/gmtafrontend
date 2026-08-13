import { useState } from "react";
import { useWizard } from "./hooks/useWizard";
import Landing from "./components/Landing";
import StepHeader from "./components/StepHeader";
import Sidebar from "./components/Sidebar";
import Step1Research from "./components/steps/Step1Research";
import Step2Competitors from "./components/steps/Step2Competitors";
import Step3Campaigns from "./components/steps/Step3Campaigns";
import Step4Customers from "./components/steps/Step4Customers";
import Step5DecisionMakers from "./components/steps/Step5DecisionMakers";
import Step6WriteEmails from "./components/steps/Step6WriteEmails";

function App() {
  const wizard = useWizard();
  const [url, setUrl] = useState("");
  const [pickedCompany, setPickedCompany] = useState(null); // name+logo known the instant it's picked, before step 1 finishes

  async function handleStart(submittedUrl, picked) {
    setUrl(submittedUrl);
    setPickedCompany(picked || null);
    await wizard.runAll(submittedUrl);
  }

  if (wizard.currentStep === 0) {
    return (
      <Landing
        onSubmit={handleStart}
        loading={wizard.loadingStep === 1}
        error={wizard.error}
      />
    );
  }

  // Once step 1's real analysis lands it's the authoritative, fuller profile — until
  // then, fall back to the name/description already known from picking it off the
  // search dropdown, so the sidebar shows a logo+name immediately instead of staying
  // empty through the whole first step.
  const sidebarCompany =
    wizard.company ||
    (pickedCompany && { companyName: pickedCompany.name, whatTheyDo: pickedCompany.description });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentStep={wizard.currentStep}
        company={sidebarCompany}
        url={url}
        competitors={wizard.competitors}
        campaigns={wizard.campaigns}
      />

      <div className="flex-1 overflow-y-auto">
        <StepHeader currentStep={wizard.currentStep} />

        {wizard.error ? (
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-lg border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative">
              {wizard.error}
            </div>
          </div>
        ) : (
          <>
            {wizard.currentStep === 1 && (
              <Step1Research url={url} company={wizard.company} loading={wizard.loadingStep === 1} />
            )}

            {wizard.currentStep === 2 && (
              <Step2Competitors
                company={wizard.company}
                competitors={wizard.competitors}
                loading={wizard.loadingStep === 2}
              />
            )}

            {wizard.currentStep === 3 && (
              <Step3Campaigns campaigns={wizard.campaigns} loading={wizard.loadingStep === 3} />
            )}

            {wizard.currentStep === 4 && (
              <Step4Customers customers={wizard.customers} loading={wizard.loadingStep === 4} />
            )}

            {wizard.currentStep === 5 && (
              <Step5DecisionMakers
                decisionMakers={wizard.decisionMakers}
                loading={wizard.loadingStep === 5}
              />
            )}

            {wizard.currentStep === 6 && (
              <Step6WriteEmails
                people={wizard.emailPeople}
                emails={wizard.emails}
                loading={wizard.loadingStep === 6}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
