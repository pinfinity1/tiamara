import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

// ۱. اینترفیس حالا شامل تمام فیلدهای پروفایل جامع است
interface UpdateUserProfileBody {
  name?: string;
  email?: string;

  // بخش ۱: اطلاعات پایه
  ageRange?: string;
  gender?: string;
  isPregnantOrNursing?: boolean;

  // بخش ۲: ارزیابی پوست
  skinType?: string;
  skinSensitivity?: string;
  skinConcerns?: string[];
  skincareGoals?: string[]; // (این فیلد در schemaی نهایی ما بود)
  acneType?: string;
  eyeConcerns?: string[];

  // بخش ۳: سبک زندگی و محیط
  sleepHours?: string;
  stressLevel?: string;
  waterIntake?: string;
  dietHabits?: string[];
  smokingHabit?: string;
  environmentType?: string;
  climate?: string;

  // بخش ۴: روتین فعلی و سابقه
  currentRoutineProducts?: string[];
  activeIngredients?: string[];
  medications?: string;
  knownAllergies?: string[];

  // بخش ۵: ترجیحات
  routineComplexity?: string;
  texturePreferences?: string[];
  productPreferences?: string[];
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      // ۲. انتخاب (select) کردن تمام فیلدهای جدید از دیتابیس
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ageRange: true,
        gender: true,
        isPregnantOrNursing: true,
        skinType: true,
        skinSensitivity: true,
        skinConcerns: true,
        skincareGoals: true,
        acneType: true,
        eyeConcerns: true,
        sleepHours: true,
        stressLevel: true,
        waterIntake: true,
        dietHabits: true,
        smokingHabit: true,
        environmentType: true,
        climate: true,
        currentRoutineProducts: true,
        activeIngredients: true,
        medications: true,
        knownAllergies: true,
        routineComplexity: true,
        texturePreferences: true,
        productPreferences: true,
      },
    });

    if (!user) {
      res.status(4404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    // ۳. گرفتن تمام فیلدهای جدید از body درخواست
    const {
      name,
      email,
      ageRange,
      gender,
      isPregnantOrNursing,
      skinType,
      skinSensitivity,
      skinConcerns,
      skincareGoals,
      acneType,
      eyeConcerns,
      sleepHours,
      stressLevel,
      waterIntake,
      dietHabits,
      smokingHabit,
      environmentType,
      climate,
      currentRoutineProducts,
      activeIngredients,
      medications,
      knownAllergies,
      routineComplexity,
      texturePreferences,
      productPreferences,
    } = req.body as UpdateUserProfileBody;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    // ۴. آپدیت کردن تمام فیلدهای جدید در دیتابیس
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        ageRange,
        gender,
        isPregnantOrNursing: gender === "خانم" ? isPregnantOrNursing : null,
        skinType,
        skinSensitivity,
        skinConcerns,
        skincareGoals,
        acneType,
        eyeConcerns,
        sleepHours,
        stressLevel,
        waterIntake,
        dietHabits,
        smokingHabit,
        environmentType,
        climate,
        currentRoutineProducts,
        activeIngredients,
        medications,
        knownAllergies,
        routineComplexity,
        texturePreferences,
        productPreferences,
      },
      // ۵. بازگرداندن (select) تمام فیلدهای آپدیت شده
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ageRange: true,
        gender: true,
        isPregnantOrNursing: true,
        skinType: true,
        skinSensitivity: true,
        skinConcerns: true,
        skincareGoals: true,
        acneType: true,
        eyeConcerns: true,
        sleepHours: true,
        stressLevel: true,
        waterIntake: true,
        dietHabits: true,
        smokingHabit: true,
        environmentType: true,
        climate: true,
        currentRoutineProducts: true,
        activeIngredients: true,
        medications: true,
        knownAllergies: true,
        routineComplexity: true,
        texturePreferences: true,
        productPreferences: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSkinProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    // تمام فیلدهای پروفایل پوستی را به مقادیر پیش‌فرض (خالی) برمی‌گردانیم
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ageRange: null,
        gender: null,
        isPregnantOrNursing: null,
        skinType: null,
        skinSensitivity: null,
        skinConcerns: [],
        skincareGoals: [],
        acneType: null,
        eyeConcerns: [],
        sleepHours: null,
        stressLevel: null,
        waterIntake: null,
        dietHabits: [],
        smokingHabit: null,
        environmentType: null,
        climate: null,
        currentRoutineProducts: [],
        activeIngredients: [],
        medications: null,
        knownAllergies: [],
        routineComplexity: null,
        texturePreferences: [],
        productPreferences: [],
      },
      // سلکت کردن همان فیلدهایی که در getUserProfile سلکت کردیم
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ageRange: true,
        gender: true,
        isPregnantOrNursing: true,
        skinType: true,
        skinSensitivity: true,
        skinConcerns: true,
        skincareGoals: true,
        acneType: true,
        eyeConcerns: true,
        sleepHours: true,
        stressLevel: true,
        waterIntake: true,
        dietHabits: true,
        smokingHabit: true,
        environmentType: true,
        climate: true,
        currentRoutineProducts: true,
        activeIngredients: true,
        medications: true,
        knownAllergies: true,
        routineComplexity: true,
        texturePreferences: true,
        productPreferences: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
