import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-82f4c750/health", (c) => {
  return c.json({ status: "ok" });
});

// Academic login endpoint
app.post("/make-server-82f4c750/academic-login", async (c) => {
  try {
    const { codigo, password } = await c.req.json();
    
    // Validate academic credentials (código: 2023077282, password: 123456)
    if (codigo === "2023077282" && password === "123456") {
      const academicEmail = `${codigo}@upt.edu.pe`;
      
      return c.json({ 
        success: true, 
        user: {
          id: `student-${codigo}`,
          email: academicEmail,
          user_metadata: {
            name: "Cristhian Estudiante",
            avatar_url: "",
            role: "student",
            login_type: "academic",
            codigo: codigo
          }
        },
        access_token: "academic-token"
      });
    } else {
      return c.json({ error: "Código o contraseña incorrectos" }, 401);
    }
  } catch (error) {
    console.error("Academic login error:", error);
    return c.json({ error: "Error interno del servidor durante login académico" }, 500);
  }
});

// Administrative login endpoint
app.post("/make-server-82f4c750/admin-login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Validate admin credentials
    if (username === "admin" && password === "admin") {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      
      // Create or get admin user
      const adminEmail = "admin@integra-upt.edu.pe";
      
      // Try to create admin user if it doesn't exist
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "admin123!",
        user_metadata: { 
          name: "Administrador", 
          avatar_url: "", 
          role: "admin",
          login_type: "administrative"
        },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true
      });
      
      // If user already exists, try to sign them in
      if (createError && createError.message.includes("already been registered")) {
        // Generate a session token for the admin user
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: adminEmail
        });
        
        if (signInError) {
          console.error("Admin sign in error:", signInError);
          return c.json({ error: "Error durante la autenticación administrativa: " + signInError.message }, 500);
        }
        
        return c.json({ 
          success: true, 
          user: {
            id: "admin-user",
            email: adminEmail,
            user_metadata: {
              name: "Administrador",
              avatar_url: "",
              role: "admin",
              login_type: "administrative"
            }
          },
          access_token: signInData.properties?.access_token || "admin-token"
        });
      }
      
      if (createError && !createError.message.includes("already been registered")) {
        console.error("Admin user creation error:", createError);
        return c.json({ error: "Error al crear usuario administrador: " + createError.message }, 500);
      }
      
      return c.json({ 
        success: true, 
        user: userData?.user || {
          id: "admin-user",
          email: adminEmail,
          user_metadata: {
            name: "Administrador",
            avatar_url: "",
            role: "admin",
            login_type: "administrative"
          }
        },
        access_token: "admin-token"
      });
    } else {
      return c.json({ error: "Credenciales administrativas inválidas" }, 401);
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return c.json({ error: "Error interno del servidor durante login administrativo" }, 500);
  }
});

Deno.serve(app.fetch);