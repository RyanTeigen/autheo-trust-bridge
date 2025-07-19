import ConsentRequestCard from "../components/ConsentRequestCard";

export default function ConsentPage() {
  const handleConsent = () => {
    // TODO: connect to backend
    alert("Consent granted!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ConsentRequestCard
        requester="Dr. Smith at General Hospital"
        dataTypes={["Allergies", "Lab Results", "Vitals"]}
        duration="30 days"
        onConsent={handleConsent}
      />
    </div>
  );
}