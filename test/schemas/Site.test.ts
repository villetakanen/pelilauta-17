import { describe, expect, test } from "vitest";
import {
  PageRefSchema,
  SiteSchema,
  siteFrom,
} from "../../src/schemas/SiteSchema";

test("siteFrom parses a site with minimal data", () => {
  const data = {
    key: "a",
  };
  const site = siteFrom(data);
  const parsed = SiteSchema.parse(site);
  expect(parsed).toEqual(site);
});

describe("PageRefSchema", () => {
  test("should accept order field", () => {
    const pageRef = {
      key: "test-page",
      name: "Test Page",
      author: "user123",
      flowTime: 1234567890,
      order: 5,
    };

    expect(() => PageRefSchema.parse(pageRef)).not.toThrow();
    const parsed = PageRefSchema.parse(pageRef);
    expect(parsed.order).toBe(5);
  });

  test("should allow order field to be optional", () => {
    const pageRef = {
      key: "test-page",
      name: "Test Page",
      author: "user123",
      flowTime: 1234567890,
      // order field omitted
    };

    expect(() => PageRefSchema.parse(pageRef)).not.toThrow();
    const parsed = PageRefSchema.parse(pageRef);
    expect(parsed.order).toBeUndefined();
  });

  test("should accept order field with zero value", () => {
    const pageRef = {
      key: "first-page",
      name: "First Page",
      author: "user123",
      flowTime: 1234567890,
      order: 0,
    };

    expect(() => PageRefSchema.parse(pageRef)).not.toThrow();
    const parsed = PageRefSchema.parse(pageRef);
    expect(parsed.order).toBe(0);
  });

  test("should reject invalid order field type", () => {
    const pageRef = {
      key: "test-page",
      name: "Test Page",
      author: "user123",
      flowTime: 1234567890,
      order: "invalid", // Should be number
    };

    expect(() => PageRefSchema.parse(pageRef)).toThrow();
  });
});
