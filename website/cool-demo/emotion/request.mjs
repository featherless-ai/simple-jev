// Request construction and response validation for the emotion camera.
export const emotions = {
  happy: "Smiling, joyful, pleased",
  sad: "Downcast, unhappy, sorrowful",
  angry: "Frowning, annoyed, hostile",
  surprised: "Raised eyebrows, open mouth, astonished",
  fearful: "Scared, anxious, alarmed",
  disgusted: "Wrinkled nose, repulsed",
  neutral: "Relaxed, expressionless, no strong emotion",
};
export const valenceRubric = [
  "Very negative",
  "Somewhat negative",
  "Neutral",
  "Somewhat positive",
  "Very positive",
];
export const energyRubric = [
  "Very calm and still",
  "Relaxed",
  "Moderately animated",
  "Highly animated or intense",
];

export function buildRequest(model, image) {
  if (!/gemma|qwen/i.test(model))
    throw Error("Choose a Gemma or Qwen vision model.");
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image))
    throw Error("A camera frame is required.");
  return {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "A live webcam still of a person." },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ],
    questions: {
      emotion: {
        type: "choice",
        instructions:
          "Which emotion does the person's facial expression show most strongly?",
        criteria: emotions,
      },
      valence: {
        type: "score",
        instructions: "How positive or negative is the person's expression?",
        criteria: valenceRubric,
      },
      energy: {
        type: "score",
        instructions: "How intense or animated is the person's expression?",
        criteria: energyRubric,
      },
      face: {
        type: "noul",
        instructions: "A human face is clearly visible in the image.",
      },
    },
  };
}

const inUnit = (x) => Number.isFinite(x) && x >= 0 && x <= 1;

// Returns normalized readings, or throws rather than displaying a partial result.
export function readingFrom(data) {
  const { emotion, valence, energy, face } = data?.answers ?? {};
  if (
    !emotion ||
    !Object.hasOwn(emotions, emotion.choice) ||
    !Object.keys(emotions).every((k) => inUnit(emotion.probabilities?.[k])) ||
    !Number.isFinite(valence?.score) ||
    valence.score < 0 ||
    valence.score > valenceRubric.length - 1 ||
    !Number.isFinite(energy?.score) ||
    energy.score < 0 ||
    energy.score > energyRubric.length - 1 ||
    !inUnit(face?.noul)
  )
    throw Error("The API returned an invalid classification.");
  return {
    emotion: emotion.choice,
    confidence: emotion.confidence,
    probabilities: emotion.probabilities,
    // Expected rubric index mapped to -1..1 and 0..1 for display.
    valence: (valence.score / (valenceRubric.length - 1)) * 2 - 1,
    energy: energy.score / (energyRubric.length - 1),
    faceVisible: face.noul >= 0.5,
  };
}
