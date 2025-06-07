"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signUp } from "@/lib/services/auth-service";

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString() || "";
  const surname = formData.get("surname")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const roleId = Number(formData.get("roleId"));

  if (!email || !password || !roleId) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Todos los campos son obligatorios."
    );
  }

  const result = await signUp({ name, surname, phone, email, password, roleId });
  if (!result.success) {
    return encodedRedirect("error", "/sign-up", result.message || "Error al registrarse");
  }

  // Redirigir a selección de tipo de usuario si es necesario, o a login
  return encodedRedirect("success", "/sign-in", "Registro exitoso. Inicia sesión.");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleId = Number(formData.get("roleId")) || 2; // Default to Admin if not provided

  const result = await signIn(email, password, roleId);
  if (!result.success) {
    return encodedRedirect("error", "/sign-in", result.message || "Error al iniciar sesión");
  }

  // Guardar en localStorage debe hacerse en el cliente, aquí solo redirigimos
  return redirect("/dashboard/analytics");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
