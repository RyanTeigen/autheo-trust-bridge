
export const getGlucoseStatus = (glucose: number, mealTiming: string) => {
  if (!glucose) return null;
  
  // Different ranges based on meal timing
  switch (mealTiming) {
    case 'fasting':
      if (glucose < 70) return { status: 'low', message: 'Low fasting glucose (hypoglycemia)', color: 'red' };
      if (glucose <= 99) return { status: 'normal', message: 'Normal fasting glucose', color: 'green' };
      if (glucose <= 125) return { status: 'prediabetic', message: 'Prediabetic fasting glucose', color: 'yellow' };
      return { status: 'diabetic', message: 'Diabetic fasting glucose', color: 'red' };
    
    case '2hr_post_meal':
      if (glucose < 70) return { status: 'low', message: 'Low post-meal glucose', color: 'red' };
      if (glucose <= 139) return { status: 'normal', message: 'Normal post-meal glucose', color: 'green' };
      if (glucose <= 199) return { status: 'prediabetic', message: 'Prediabetic post-meal glucose', color: 'yellow' };
      return { status: 'diabetic', message: 'Diabetic post-meal glucose', color: 'red' };
    
    default:
      if (glucose < 70) return { status: 'low', message: 'Low glucose (hypoglycemia)', color: 'red' };
      if (glucose <= 180) return { status: 'normal', message: 'Normal glucose range', color: 'green' };
      return { status: 'high', message: 'High glucose level', color: 'red' };
  }
};

export const getHbA1cStatus = (hba1c: number) => {
  if (!hba1c) return null;
  
  if (hba1c < 5.7) return { status: 'normal', message: 'Normal HbA1c', color: 'green' };
  if (hba1c <= 6.4) return { status: 'prediabetic', message: 'Prediabetic HbA1c', color: 'yellow' };
  if (hba1c <= 7.0) return { status: 'diabetic_good', message: 'Diabetic - Good control', color: 'blue' };
  if (hba1c <= 8.0) return { status: 'diabetic_fair', message: 'Diabetic - Fair control', color: 'yellow' };
  return { status: 'diabetic_poor', message: 'Diabetic - Poor control', color: 'red' };
};
