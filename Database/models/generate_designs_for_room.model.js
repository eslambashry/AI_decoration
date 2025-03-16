import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedImage:{
    secure_url: String,
    public_id: String
  },
  generatedImage:[{
    type: String,required: true
  }],
  roomType: { 
    type: String, 
    enum: [
      "livingroom", "kitchen", "diningroom", "bedroom", "bathroom", "kidsroom",
      "familyroom", "readingnook", "sunroom", "walkincloset", "mudroom", "toyroom",
      "office", "foyer", "powderroom", "laundryroom", "gym", "basement", "garage",
      "balcony", "cafe", "homebar", "study_room", "front_porch", "back_porch",
      "back_patio", "openplan", "boardroom", "meetingroom", "openworkspace", 
      "privateoffice"
    ],
    required: true
  },
  designStyle: { 
    type: String, 
    enum: [
      "minimalist", "scandinavian", "industrial", "boho", "traditional", "artdeco",
      "midcenturymodern", "coastal", "tropical", "eclectic", "contemporary", 
      "frenchcountry", "rustic", "shabbychic", "vintage", "country", "modern",
      "asian_zen", "hollywoodregency", "bauhaus", "mediterranean", "farmhouse",
      "victorian", "gothic", "moroccan", "southwestern", "transitional", 
      "maximalist", "arabic", "japandi", "retrofuturism", "artnouveau", "urbanmodern",
      "wabi_sabi", "grandmillennial", "coastalgrandmother", "newtraditional", 
      "cottagecore", "luxemodern", "high_tech", "organicmodern", "tuscan", "cabin",
      "desertmodern", "global", "industrialchic", "modernfarmhouse", "europeanclassic",
      "neotraditional", "warmminimalist"
    ],
    required: true
  },
  numImages: { type: Number, min: 1, max: 4, required: true },
  scaleFactor: { type: Number, min: 1, max: 8, default: 1 },
  colorScheme: { 
    type: String, 
    enum: [
      "COLOR_SCHEME_0", "COLOR_SCHEME_1", "COLOR_SCHEME_2", "COLOR_SCHEME_3",
      "COLOR_SCHEME_4", "COLOR_SCHEME_5", "COLOR_SCHEME_6", "COLOR_SCHEME_7",
      "COLOR_SCHEME_8", "COLOR_SCHEME_9", "COLOR_SCHEME_10", "COLOR_SCHEME_11",
      "COLOR_SCHEME_12", "COLOR_SCHEME_13", "COLOR_SCHEME_14", "COLOR_SCHEME_15",
      "COLOR_SCHEME_16", "COLOR_SCHEME_17", "COLOR_SCHEME_18", "COLOR_SCHEME_19",
      "COLOR_SCHEME_20"
    ],
    default: "COLOR_SCHEME_0"
  },
  specialityDecor: { 
    type: String, 
    enum: [
      "SPECIALITY_DECOR_0", "SPECIALITY_DECOR_1", "SPECIALITY_DECOR_2", "SPECIALITY_DECOR_3",
      "SPECIALITY_DECOR_4", "SPECIALITY_DECOR_5", "SPECIALITY_DECOR_6", "SPECIALITY_DECOR_7"
    ],
    default: "SPECIALITY_DECOR_0"
  },
  prompt: { type: String }, // Custom user prompt
  promptPrefix: { type: String }, // Prefix to guide style
  promptSuffix: { type: String }, // Suffix for quality
  negativePrompt: { type: String }, // What to avoid in image generation
  seed: { type: Number, min: 0 }, // For reproducibility
  guidanceScale: { type: Number, min: 1, max: 20, default: 15 },
  numInferenceSteps: { type: Number, min: 1, max: 75, default: 50 },
  createdAt: { type: Date, default: Date.now },
  customId: { type: String, unique: true }, // Unique identifier
});

export const DesignModel = mongoose.model('Design', designSchema);



// Value	Color Scheme
// COLOR_SCHEME_0	Default
// COLOR_SCHEME_1	Moss Green, Tan, White
// COLOR_SCHEME_2	Gray, Sand, Blue
// COLOR_SCHEME_3	Hunter Green, Red
// COLOR_SCHEME_4	White, Pops of Color
// COLOR_SCHEME_5	Blue, Neon
// COLOR_SCHEME_6	Light Blue, Emerald
// COLOR_SCHEME_7	Blue, Grass Green
// COLOR_SCHEME_8	Blue, Beige
// COLOR_SCHEME_9	Gray, Brown
// COLOR_SCHEME_10	Black, Red
// COLOR_SCHEME_11	Gray-Green, White, Black
// COLOR_SCHEME_12	Blue, Gray, Taupe
// COLOR_SCHEME_13	Black, Navy
// COLOR_SCHEME_14	Emerald, Tan
// COLOR_SCHEME_15	Forest Green, Light Gray
// COLOR_SCHEME_16	Yellow, Gray
// COLOR_SCHEME_17	Pink, Green
// COLOR_SCHEME_18	Blush Pink, Black
// COLOR_SCHEME_19	Black, White
// COLOR_SCHEME_20	Blue, White

// Value	Speciality Decor
// SPECIALITY_DECOR_0	None
// SPECIALITY_DECOR_1	Halloween Decor with Spooky Ambiance, Eerie Elements, Dark Colors, and Festive Accents
// SPECIALITY_DECOR_2	Christmas Decor with Christmas Tree, Ornaments, and Lights
// SPECIALITY_DECOR_3	Thanksgiving Decor, Fall Season Decor
// SPECIALITY_DECOR_4	Fall Season Decor
// SPECIALITY_DECOR_5	Spring Season Decor
// SPECIALITY_DECOR_6	Summer Season Decor
// SPECIALITY_DECOR_7	Winter Season Decor