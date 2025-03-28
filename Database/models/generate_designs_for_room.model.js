import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedImage:{
    secure_url: String,
    public_id: String
  },
  generatedImage:[{
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
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

// scale_factor	
// integer (ScaleFactor) [ 1 .. 8 ]
// Scale factor determines the image resolution. See the table below for more details:

// Scale Factor	Image Dimensions (max)	Design Credits Used
// 1	Max 768 pixels	0 credits
// 2	Max 1536 pixels	0 credits
// 3	Max 2304 pixels	1 credit
// 4	Max 3072 pixels	1 credit
// 5	Max 3840 pixels	2 credits
// 6	Max 4608 pixels	2 credits
// 7	Max 5376 pixels	3 credits
// 8	Max 6144 pixels	3 credits


// prompt	
// string
// (Optional) Custom prompt for image generation. If provided, room_type, design_style, color_scheme, and speciality_decor values are ignored as the prompt field is used directly for image generation. If prompt is not provided, then room_type and design_style must be provided and will be used to generate a system-selected prompt. During image generation, the API concatenates prompts as follows: final_prompt = [prompt_prefix] + " " + [prompt] + " " + [prompt_suffix] This final_prompt along with negative_prompt guides the stable diffusion image generation process. Note: Using custom prompts provides more control over image generation but may require experimentation to achieve desired results.

// prompt_prefix	
// string
// (Optional) Prefix to identify visual attributes of desired references (e.g., "Houzz style", "Pinterest inspiration", "architectural photography"). Default is system selected. Note: Custom prefix can help target specific visual styles but may require experimentation.

// prompt_suffix	
// string
// (Optional) Suffix to identify photo attributes (e.g., "4K resolution", "interior design magazine quality", "professional lighting"). Default is system selected. Note: Custom suffix can help enhance image quality but may require experimentation.

// negative_prompt	
// string
// (Optional) Attributes to exclude from generation (e.g., "blurry", "low quality", "distorted", "unrealistic", "broken furniture"). Default is system selected. Note: Custom negative prompts can help avoid unwanted elements but may require experimentation.

// seed	
// integer >= 0
// (Optional) Seed for reproducible results. Using the same seed with identical parameters will generate similar images. Default is random. Note: Useful for consistency across generations but results may still vary slightly.

// guidance_scale	
// number <float> [ 1 .. 20 ]
// Default: 15
// (Optional) Controls how closely the model follows the prompt. Higher values result in images that more strictly follow the prompt but may be less natural. Lower values allow more creative freedom but may deviate from the prompt. Default is 15. Note: Finding the right balance requires experimentation.

// num_inference_steps	
// integer [ 1 .. 75 ]
// Default: 50
// (Optional) Number of denoising steps. Higher values can produce better quality images but take longer to generate. Lower values are faster but may reduce quality. Default is 50. Note: Balance between quality and generation time requires experimentation.




// {
//   "input_image_url": "https://example.com/image.jpg",
//   "room_type": "livingroom",
//   "design_style": "modern",
//   "num_images": 1,
//   "scale_factor": 3,
//   "color_scheme": "COLOR_SCHEME_0",
//   "speciality_decor": "SPECIALITY_DECOR_0",
//   "mask_info": "room_edges, windows highlighted",
//   "prompt": "A modern living room with clean lines, large windows, and minimalistic furniture. Soft lighting and neutral tones.",
//   "prompt_prefix": "Houzz style",
//   "prompt_suffix": "interior design magazine quality",
//   "negative_prompt": "blurry, low quality, distorted",
//   "seed": 42,
//   "guidance_scale": 15,
//   "num_inference_steps": 50
// }
