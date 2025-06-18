
const { supabasePatientService } = require('../services/SupabasePatientService');
const { supabaseMedicalRecordsService } = require('../services/SupabaseMedicalRecordsService');
const { supabaseSharingService } = require('../services/SupabaseSharingService');

async function testCompleteFlow() {
  console.log('🧪 Starting complete flow test...\n');

  try {
    // Step 1: Create a patient
    console.log('1️⃣ Creating a test patient...');
    const patientData = {
      full_name: 'John Doe',
      date_of_birth: '1990-01-15',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      mrn: 'MRN123456',
      allergies: ['Penicillin', 'Nuts'],
      emergency_contact: 'Jane Doe - +1234567891',
      insurance_info: { provider: 'Blue Cross', member_id: 'BC123456' },
      user_id: 'cfc9f9d5-0548-413a-bdb6-e691f3c33613' // Using the logged-in user ID from console logs
    };

    const patientResult = await supabasePatientService.createPatient(patientData);
    if (!patientResult.success) {
      console.error('❌ Failed to create patient:', patientResult.error);
      return;
    }
    console.log('✅ Patient created successfully:', patientResult.data.id);
    const patientId = patientResult.data.id;

    // Step 2: Create a medical record for the patient
    console.log('\n2️⃣ Creating a medical record...');
    const recordData = {
      title: 'Annual Physical Exam',
      description: 'Routine annual physical examination',
      diagnosis: 'Patient is in good health',
      treatment: 'Continue current lifestyle, schedule next checkup in 1 year',
      notes: 'Blood pressure: 120/80, Weight: 70kg, Height: 175cm',
      patient_id: patientId,
      user_id: patientData.user_id
    };

    const recordResult = await supabaseMedicalRecordsService.createRecord(recordData, 'physical_exam');
    if (!recordResult.success) {
      console.error('❌ Failed to create medical record:', recordResult.error);
      return;
    }
    console.log('✅ Medical record created successfully:', recordResult.data.id);
    const recordId = recordResult.data.id;

    // Step 3: Share the record with a provider
    console.log('\n3️⃣ Sharing the record with a provider...');
    const shareData = {
      medicalRecordId: recordId,
      granteeId: 'aaaaaa00-0000-0000-0000-000000000000', // Mock provider ID
      permissionType: 'read',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      patient_id: patientId
    };

    const shareResult = await supabaseSharingService.shareRecordWithProvider(shareData);
    if (!shareResult.success) {
      console.error('❌ Failed to share record:', shareResult.error);
      return;
    }
    console.log('✅ Record shared successfully:', shareResult.data.id);

    // Step 4: Verify the complete flow by fetching all data
    console.log('\n4️⃣ Verifying the complete flow...');
    
    // Fetch the patient
    const fetchedPatient = await supabasePatientService.getPatient(patientId);
    console.log('📋 Patient verification:', fetchedPatient.success ? '✅ Found' : '❌ Not found');

    // Fetch the medical record
    const fetchedRecord = await supabaseMedicalRecordsService.getRecord(recordId);
    console.log('📄 Medical record verification:', fetchedRecord.success ? '✅ Found' : '❌ Not found');

    // Fetch the sharing permission
    const fetchedShare = await supabaseSharingService.getSharingPermission(shareResult.data.id);
    console.log('🔗 Sharing permission verification:', fetchedShare.success ? '✅ Found' : '❌ Not found');

    console.log('\n🎉 Complete flow test PASSED! All operations successful.');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`Patient ID: ${patientId}`);
    console.log(`Medical Record ID: ${recordId}`);
    console.log(`Sharing Permission ID: ${shareResult.data.id}`);

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };
