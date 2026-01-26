// app/page/Course/[id]/page.tsx
"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import SkillCard from "@/app/components/SkillCard/SkillCard";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/api/auth";
import {
  getCourseById,
  getCurrentUser,
  addCourseToUser,
  removeCourseFromUser,
  resetCourseProgress,
  Course as CourseType,
  UserData,
} from "@/app/api/simple-api";
import SigninPopup from "@/app/components/PopUp/Signin/SigninPopup";

// Тип для ответа с вложенным user
interface UserResponseWithNestedUser {
  user: {
    _id: string;
    email: string;
    selectedCourses: string[];
    courseProgress?: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

// Тип для проверки структуры ответа
type ApiUserResponse = UserData | UserResponseWithNestedUser | null;

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [removingCourse, setRemovingCourse] = useState(false);
  const [userData, setUserData] = useState<ApiUserResponse>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [courseAdded, setCourseAdded] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Получаем query-параметры из URL
  const imageUrl = searchParams?.get("imageUrl");
  const backgroundColor = searchParams?.get("backgroundColor");
  const imageWidth = searchParams?.get("imageWidth");
  const imageHeight = searchParams?.get("imageHeight");
  const imageTop = searchParams?.get("imageTop");
  const imageRight = searchParams?.get("imageRight");

  // Получаем ID курса из параметров
  useEffect(() => {
    const getCourseId = async () => {
      const { id } = await params;
      setCourseId(id);
      console.log("ID курса из URL:", id);
    };
    getCourseId();
  }, [params]);

  // Функция для загрузки данных пользователя с проверкой курса
  const fetchUserDataWithCourseCheck = useCallback(async (): Promise<{
    userData: ApiUserResponse;
    isCourseAdded: boolean;
  }> => {
    try {
      if (!isAuthenticated() || !courseId) {
        console.log("Пользователь не авторизован или нет ID курса");
        return { userData: null, isCourseAdded: false };
      }

      console.log("Загружаю данные пользователя для проверки курса...");
      const userResponse = await getCurrentUser();

      // Приводим к типу ApiUserResponse
      const typedResponse = userResponse as ApiUserResponse;

      // ВАЖНО: Проверяем структуру ответа
      console.log(
        "Полный ответ от getCurrentUser():",
        JSON.stringify(typedResponse, null, 2),
      );

      // Обрабатываем возможные структуры ответа
      let selectedCourses: string[] = [];

      // Вариант 1: если ответ имеет структуру { user: { ... } }
      if (typedResponse && "user" in typedResponse && typedResponse.user) {
        selectedCourses = typedResponse.user.selectedCourses || [];
        console.log(
          "Нашли курсы в user.user.selectedCourses:",
          selectedCourses,
        );
      }
      // Вариант 2: если ответ имеет структуру UserData (прямые поля)
      else if (typedResponse && "selectedCourses" in typedResponse) {
        selectedCourses = typedResponse.selectedCourses || [];
        console.log("Нашли курсы в user.selectedCourses:", selectedCourses);
      }
      // Вариант 3: если это уже массив курсов (вряд ли, но на всякий случай)
      else if (Array.isArray(typedResponse)) {
        selectedCourses = typedResponse;
        console.log("Ответ - это массив курсов:", selectedCourses);
      } else {
        console.log("Неизвестная структура ответа");
      }

      console.log("Курсы пользователя после обработки:", selectedCourses);
      console.log("Ищем курс с ID:", courseId);

      // Проверяем, добавлен ли текущий курс
      const isAdded = selectedCourses.includes(courseId);
      console.log("Результат проверки курса:", {
        courseId,
        isAdded,
        foundIndex: selectedCourses.indexOf(courseId),
        userCourses: selectedCourses,
      });

      return {
        userData: typedResponse,
        isCourseAdded: isAdded,
      };
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
      // Если ошибка 401 (не авторизован), очищаем токен
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("auth_token");
        window.dispatchEvent(new Event("authStateChanged"));
      }
      return { userData: null, isCourseAdded: false };
    }
  }, [courseId]);

  // Загружаем данные курса и проверяем статус
  useEffect(() => {
    const loadCourseAndCheckStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!courseId) return;

        console.log("=== НАЧАЛО ЗАГРУЗКИ СТРАНИЦЫ КУРСА ===");
        console.log("ID курса для загрузки:", courseId);

        // 1. Загружаем данные курса
        console.log("Загружаю данные курса...");
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        console.log("Данные курса загружены:", {
          id: courseData._id,
          name: courseData.nameRU,
        });

        // 2. Проверяем авторизацию
        const auth = isAuthenticated();
        console.log("Пользователь авторизован:", auth);

        if (auth) {
          // 3. Загружаем данные пользователя и проверяем курс
          const { userData, isCourseAdded } =
            await fetchUserDataWithCourseCheck();
          setUserData(userData);
          setCourseAdded(isCourseAdded);

          console.log("=== РЕЗУЛЬТАТ ПРОВЕРКИ ===");
          console.log("Курс добавлен у пользователя:", isCourseAdded);
          console.log("ID текущего курса:", courseData._id);

          // Дополнительная проверка
          if (userData) {
            let courses: string[] = [];
            if ("user" in userData && userData.user) {
              courses = userData.user.selectedCourses || [];
            } else if ("selectedCourses" in userData) {
              courses = userData.selectedCourses || [];
            }
            console.log("Курсы пользователя (для проверки):", courses);
            console.log(
              "Содержит ли текущий ID?",
              courses.includes(courseData._id),
            );
          }
        } else {
          // Не авторизован - курс точно не добавлен
          setCourseAdded(false);
          setUserData(null);
          console.log("Пользователь не авторизован, курс не добавлен");
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        const error = err as Error;

        if (error.message?.includes("404")) {
          setError("Курс не найден");
        } else if (error.message?.includes("400")) {
          setError("Неверный запрос. Проверьте ID курса.");
        } else {
          setError(error.message || "Ошибка при загрузке данных");
        }
      } finally {
        setLoading(false);
        console.log("=== ЗАВЕРШЕНИЕ ЗАГРУЗКИ ===");
      }
    };

    if (courseId) {
      loadCourseAndCheckStatus();
    }
  }, [courseId, fetchUserDataWithCourseCheck]);

  // Слушаем события обновления данных пользователя
  useEffect(() => {
    const handleUserDataUpdated = async () => {
      console.log("=== СОБЫТИЕ: userDataUpdated ===");
      if (isAuthenticated() && courseId && course) {
        try {
          const { userData, isCourseAdded } =
            await fetchUserDataWithCourseCheck();
          setUserData(userData);
          setCourseAdded(isCourseAdded);

          console.log("Данные обновлены после события:", {
            courseId: course._id,
            isCourseAdded: isCourseAdded,
          });
        } catch (err) {
          console.error("Ошибка обновления данных пользователя:", err);
        }
      }
    };

    window.addEventListener("userDataUpdated", handleUserDataUpdated);

    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdated);
    };
  }, [courseId, course, fetchUserDataWithCourseCheck]);

  // Функция для добавления курса
  const addCourseToUserHandler = async () => {
    if (!course) return;

    setAddingCourse(true);
    try {
      const isAuth = isAuthenticated();
      if (!isAuth) {
        alert("Требуется авторизация. Пожалуйста, войдите в систему.");
        router.push("/page/SignIn");
        return;
      }

      console.log(`=== НАЧАЛО ДОБАВЛЕНИЯ КУРСА ${course._id} ===`);

      // Двойная проверка перед добавлением
      const { isCourseAdded: checkBeforeAdd } =
        await fetchUserDataWithCourseCheck();
      if (checkBeforeAdd) {
        alert("Курс уже был добавлен ранее!");
        setCourseAdded(true);
        return;
      }

      console.log("Курс не добавлен, продолжаем...");
      await addCourseToUser(course._id);
      console.log("Курс добавлен успешно на сервере");

      // Обновляем данные пользователя и статус курса
      const { userData: updatedUserData, isCourseAdded } =
        await fetchUserDataWithCourseCheck();
      setUserData(updatedUserData);
      setCourseAdded(isCourseAdded);

      console.log(
        "Данные пользователя обновлены после добавления курса:",
        "Курс добавлен:",
        isCourseAdded,
      );

      // Отправляем событие для обновления данных
      window.dispatchEvent(
        new CustomEvent("userDataUpdated", {
          detail: { courseId: course._id, action: "added" },
        }),
      );

      alert("Курс успешно добавлен!");
    } catch (err) {
      console.error("Ошибка при добавлении курса:", err);
      const error = err as Error;

      if (error.message?.includes("401")) {
        alert("Требуется авторизация. Пожалуйста, войдите в систему.");
        router.push("/page/SignIn");
      } else if (
        error.message?.includes("Курс уже был добавлен") ||
        error.message?.includes("already added")
      ) {
        alert("Курс уже был добавлен ранее!");
        // Принудительно обновляем статус
        const { isCourseAdded } = await fetchUserDataWithCourseCheck();
        setCourseAdded(isCourseAdded);
      } else {
        alert(error.message || "Ошибка при добавлении курса");
      }
    } finally {
      setAddingCourse(false);
      console.log("=== ЗАВЕРШЕНИЕ ДОБАВЛЕНИЯ КУРСА ===");
    }
  };

  // Функция для удаления курса
  const removeCourseFromUserHandler = async () => {
    if (!course) return;

    if (
      !confirm(
        "Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.",
      )
    ) {
      return;
    }

    setRemovingCourse(true);
    try {
      const isAuth = isAuthenticated();
      if (!isAuth) {
        throw new Error("Требуется авторизация");
      }

      console.log(`=== НАЧАЛО УДАЛЕНИЯ КУРСА ${course._id} ===`);

      // 1. Сначала сбрасываем прогресс курса
      try {
        await resetCourseProgress(course._id);
        console.log(`Прогресс курса ${course._id} сброшен`);
      } catch (resetError) {
        console.warn(
          `Не удалось сбросить прогресс для курса ${course._id}:`,
          resetError,
        );
      }

      // 2. Удаляем курс из списка пользователя
      await removeCourseFromUser(course._id);
      console.log("Курс удален успешно на сервере");

      // Обновляем данные пользователя и статус курса
      const { userData: updatedUserData, isCourseAdded } =
        await fetchUserDataWithCourseCheck();
      setUserData(updatedUserData);
      setCourseAdded(isCourseAdded);

      console.log(
        "Данные пользователя обновлены после удаления курса:",
        "Курс добавлен:",
        isCourseAdded,
      );

      // Отправляем событие для обновления данных
      window.dispatchEvent(
        new CustomEvent("userDataUpdated", {
          detail: { courseId: course._id, action: "removed" },
        }),
      );

      alert("Курс успешно удален!");
    } catch (err) {
      console.error("Ошибка при удалении курса:", err);
      const error = err as Error;
      alert(error.message || "Ошибка при удаления курса");
    } finally {
      setRemovingCourse(false);
      console.log("=== ЗАВЕРШЕНИЕ УДАЛЕНИЯ КУРСА ===");
    }
  };

  // Обработчик успешной авторизации
  const handleLoginSuccess = () => {
    console.log("=== ОБРАБОТЧИК УСПЕШНОЙ АВТОРИЗАЦИИ ===");

    // Обновляем статус авторизации
    const isAuth = isAuthenticated();

    // Закрываем попап
    setIsSigninOpen(false);

    // Если пользователь авторизовался, обновляем данные
    if (isAuth && courseId) {
      console.log("Пользователь авторизовался, проверяем курс...");
      fetchUserDataWithCourseCheck().then(({ userData, isCourseAdded }) => {
        setUserData(userData);
        setCourseAdded(isCourseAdded);
        console.log("Статус курса после авторизации:", isCourseAdded);
        window.dispatchEvent(new Event("authStateChanged"));
      });
    }
  };

  // Отладка рендера
  useEffect(() => {
    console.log("=== ОТЛАДКА РЕНДЕРА ===", {
      courseId,
      courseAdded,
      userData,
      course: course?._id,
      isAuth: isAuthenticated(),
    });
  });

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Загрузка курса...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Курс не найден</h2>
        <p>Курс не существует или был удален</p>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Декодируем параметры из URL
  const decodedImageUrl = imageUrl
    ? decodeURIComponent(imageUrl)
    : "/img/image_9.png";
  const decodedBackgroundColor = backgroundColor
    ? decodeURIComponent(backgroundColor)
    : "#FF6B6B";
  const decodedImageWidth = imageWidth ? decodeURIComponent(imageWidth) : "58%";
  const decodedImageHeight = imageHeight
    ? decodeURIComponent(imageHeight)
    : "119%";
  const decodedImageTop = imageTop ? decodeURIComponent(imageTop) : "-230px";
  const decodedImageRight = imageRight
    ? decodeURIComponent(imageRight)
    : "-205px";

  // Примерные данные для мотивации
  const motivationPoints = [
    "проработка всех групп мышц",
    "тренировка суставов",
    "улучшение циркуляции крови",
    "упражнения заряжают бодростью",
    "помогают противостоять стрессам",
  ];

  // Проверяем авторизацию
  const isAuth = isAuthenticated();

  console.log("=== ФИНАЛЬНЫЙ СТАТУС ПЕРЕД РЕНДЕРОМ ===", {
    isAuth: isAuth,
    courseAdded: courseAdded,
    courseId: course._id,
    courseName: course.nameRU,
    loading: loading,
    userHasData: !!userData,
  });

  return (
    <div className={styles.container}>
      {/* SkillCard с синхронизированным состоянием */}
      <SkillCard
        courseName={course.nameRU}
        imageUrl={decodedImageUrl}
        backgroundColor={decodedBackgroundColor}
        imageWidth={decodedImageWidth}
        imageHeight={decodedImageHeight}
        imageTop={decodedImageTop}
        imageRight={decodedImageRight}
      />

      {/* Попап авторизации */}
      <SigninPopup
        isOpen={isSigninOpen}
        onClose={() => setIsSigninOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenSignup={() => {}}
      />

      <div className={styles.entice}>
        <div>
          <h3 className={styles.entice__title}>Подойдет для вас, если:</h3>
        </div>
        <div className={styles.entice__disBox}>
          {course.fitting && course.fitting.length > 0
            ? course.fitting.map((item, index) => (
                <div key={index} className={styles.entice__dis}>
                  <p className={styles.entice__numb}>{index + 1}</p>
                  <p className={styles.entice__text}>{item}</p>
                </div>
              ))
            : [
                "Давно хотели попробовать, но не решались начать",
                "Хотите укрепить позвоночник, избавиться от болей в спине и суставах",
                "Ищете активность, полезную для тела и души",
              ].map((item, index) => (
                <div key={index} className={styles.entice__dis}>
                  <p className={styles.entice__numb}>{index + 1}</p>
                  <p className={styles.entice__text}>{item}</p>
                </div>
              ))}
        </div>
      </div>

      <div className={styles.Directions}>
        <h3 className={styles.Directions__title}>Направления</h3>
        <div className={styles.Directions__box}>
          {course.directions && course.directions.length > 0 ? (
            course.directions.map((direction, index) => (
              <div key={index} className={styles.Directions__description}>
                <Image
                  width={26}
                  height={26}
                  className={styles.Directions__img}
                  src="/img/Sparcle.svg"
                  alt="Sparcle"
                  priority
                />
                <p className={styles.Directions__text}>{direction}</p>
              </div>
            ))
          ) : (
            <p className={styles.noDirections}>Направления не указаны</p>
          )}
        </div>
      </div>
      <div className={styles.motivation__main}>
        <div className={styles.motivation}>
          <div className={styles.motivation__box}>
            <h3 className={styles.motivation__title}>
              Начните путь к новому телу
            </h3>
            <div className={styles.motivation__text}>
              {motivationPoints.map((point, index) => (
                <p key={index}>
                  • {point}
                  {index < motivationPoints.length - 1}
                </p>
              ))}
            </div>
            <div className={styles.motivation__but}>
              {loading ? (
                <div style={{ padding: "10px", textAlign: "center" }}>
                  <div>Загрузка...</div>
                </div>
              ) : isAuth ? (
                courseAdded ? (
                  <div className={styles.courseActions}>
                    <Link
                      href="#"
                      className={styles.removeCourseLink}
                      onClick={(e) => {
                        e.preventDefault();
                        removeCourseFromUserHandler();
                      }}
                    >
                      {removingCourse
                        ? "Удаление..."
                        : "Курс уже добавлен, Удалить?"}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="#"
                    className={styles.motivation__butLink}
                    onClick={(e) => {
                      e.preventDefault();
                      addCourseToUserHandler();
                    }}
                  >
                    {addingCourse ? "Добавление..." : "Добавить курс"}
                  </Link>
                )
              ) : (
                <Link
                  href="#"
                  className={styles.motivation__butLink}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSigninOpen(true);
                  }}
                >
                  Войдите, чтобы добавить курс
                </Link>
              )}
            </div>
          </div>
        </div>
        <Image
          width={670.18}
          height={390.98}
          className={styles.motivation__imgSvg2}
          src="/img/Vector 6084.svg"
          alt="Sparcle"
          priority
        />
        <Image
          width={50}
          height={42.5}
          className={styles.motivation__imgSvg1}
          src="/img/Vector 6094.svg"
          alt="Sparcle"
          priority
        />
        <Image
          width={547}
          height={566}
          className={styles.motivation__img}
          src="/img/skypro_mid23_Crouching_man_in_green_polo_shirt_and_navy_shorts__934c6a97-07c8-4c5b-9487-96389d003dfd Background Removed 2.png"
          alt="Sparcle"
          priority
        />
      </div>
    </div>
  );
}
