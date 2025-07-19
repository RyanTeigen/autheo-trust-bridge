import ConsentRequestCard from "../components/ConsentRequestCard";

export default function ConsentPage() {
  const handleConsent = (anchorId?: string) => {
    console.log("Consent processed with anchor ID:", anchorId);
    // Additional logic after successful consent can go here
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ConsentRequestCard
        requester="Dr. Smith at General Hospital"
        dataTypes={["Allergies", "Lab Results", "Vitals"]}
        duration="30 days"
        userId="test-user-123"
        userDid="did:autheo:test-user-123"
        onConsent={handleConsent}
      />
    </div>
  );
}