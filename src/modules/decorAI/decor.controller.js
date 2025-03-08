import axios from "axios";
import imagekit from "../../utilities/imagekitConfigration.js";
export const create = async (req, res, next) => {
  try {
    // التحقق من وجود الصورة في الطلب
    if (!req.file) {
      return next(new Error('Please upload an image', { cause: 400 }));
    }

    // رفع الصورة باستخدام ImageKit أو خدمة مشابهة
    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER}/ProcessedImage`,
    });

    // إرسال الصورة إلى Decor8AI API للمعالجة
    const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5X3V1aWQiOiJhNTZiMTQ1ZC1hNGU5LTRjODEtODE1OS0wODlkOTMxZDdkZDgiLCJpYXQiOjE3NDEwOTY4MDd9.isXqEzPZzR8R3CtiZpP5uEWwwSioIgiiTn7U3tgRLKQ';  // استبدل هذا بالتوكن الفعلي الذي لديك
    const apiResponse = await axios.post(
      'https://api.decor8.ai/generate_designs_for_room',  // تأكد من الرابط الصحيح
      {
        input_image_url: uploadResult.url,  // رابط الصورة التي تم رفعها
        room_type: req.body.room_type,  // إذا كنت تحتاج إلى بيانات إضافية مثل نوع الغرفة
        design_style: req.body.design_style,      // مثل النمط
        num_images: req.body.num_images  // مثل اللون
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`  // تضمين التوكن في الترويسة
        }
      }
    );

    console.log(apiResponse);
    
    // استخراج رابط الصورة المحاكاة من الـ API
    const stagedImageUrl = apiResponse.data.stagedImageUrl;

    // إرسال استجابة تحتوي على الرابط النهائي للصورة المحاكاة
    res.status(200).json({
      message: "Image processed successfully",
      stagedImageUrl: stagedImageUrl,  // إرسال رابط الصورة المحاكاة للمستخدم
    });

  } catch (error) {
    next(error);  // التعامل مع الأخطاء إذا حدثت
  }
};

