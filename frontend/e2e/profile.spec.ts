import { test, expect } from "@playwright/test";

test("displays the seeded backend profile and project experience", async ({
  page,
}, testInfo) => {
  const response = page.waitForResponse(
    (response) =>
      response.url().endsWith("/graphql") && response.status() === 200,
  );
  await page.goto("/");
  const body = await (await response).json();
  expect(body.errors).toBeUndefined();
  expect(body.data.profile.experience).toHaveLength(4);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Павел Константинович Мернов",
  );
  await expect(page.locator("#experience article")).toHaveCount(4);
  await expect(page.locator("#projects article")).toHaveCount(5);
  await expect(page.locator("#experience")).toContainText(
    "3 курс; точные даты не указаны",
  );
  await expect(
    page.getByRole("link", {
      name: "Визитная карточка на NestJS: репозиторий",
    }),
  ).toHaveAttribute(
    "href",
    "https://github.com/Pavel-Mernov/IT-Solutions-backend-Nest-JS",
  );
  await expect(page.locator(".project-card").last()).toContainText(
    "Playwright",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("profile.png"),
    fullPage: true,
  });
});

test("filters projects by name and technology and handles no matches", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Поиск проектов" });
  await expect(page.locator("#projects article")).toHaveCount(5);
  await search.fill("Kotlin");
  await expect(page.locator("#projects article")).toHaveCount(1);
  await expect(page.locator("#projects article")).toContainText("ClientSpace");
  await search.fill("несуществующий проект");
  await expect(page.locator("#projects article")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Проекты не найдены");
  await search.fill("");
  await expect(page.locator("#projects article")).toHaveCount(5);
});

test("shows a backend error and retries against the real API", async ({
  page,
}) => {
  await page.route("**/graphql", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Сервер временно недоступен",
  );
  await page.unroute("**/graphql");
  await page.getByRole("button", { name: "Попробовать снова" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Павел Константинович Мернов",
  );
});

test("handles GraphQL errors even when HTTP status is 200", async ({
  page,
}) => {
  await page.route("**/graphql", (route) =>
    route.fulfill({ json: { errors: [{ message: "Internal server error" }] } }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Не удалось получить профиль",
  );
});

test("shows an empty profile without crashing", async ({ page }) => {
  await page.route("**/graphql", (route) =>
    route.fulfill({ json: { data: { profile: null } } }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Профиль пока не заполнен",
  );
  await expect(page.getByRole("button", { name: "Обновить" })).toBeVisible();
});
