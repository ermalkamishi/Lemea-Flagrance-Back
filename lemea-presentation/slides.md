---
theme: default
background: https://images.unsplash.com/photo-1615655096345-61a54750068d?q=80&w=1920
class: text-center
highlighter: shiki
drawings:
  persist: false
transition: slide-left
title: Lemea Fragrance Backend Architecture
---

# Lemea Fragrance
### Backend Architecture & API Overview
<div class="text-sm opacity-50 mt-4">A Deep Dive into the Code Flow, Auth, and Key Features</div>

---
layout: default
---

# Stack & Architecture

A robust, scalable backend built with modern TypeScript technologies.

<div class="grid grid-cols-2 gap-4 mt-8">

<div class="bg-slate-800/80 border-l-4 border-indigo-500 rounded p-4 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300">
  <div class="text-indigo-400 font-bold mb-2 flex items-center gap-2">
    <div class="i-carbon-logo-github text-xl"></div> Core Framework
  </div>
  <div class="text-sm text-gray-300"><strong>NestJS & TypeScript</strong> providing a highly opinionated, Angular-like modular architecture with powerful Dependency Injection.</div>
</div>

<div class="bg-slate-800/80 border-l-4 border-emerald-500 rounded p-4 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300">
  <div class="text-emerald-400 font-bold mb-2 flex items-center gap-2">
    <div class="i-carbon-data-base text-xl"></div> Database & ORM
  </div>
  <div class="text-sm text-gray-300"><strong>PostgreSQL</strong> managed via <strong>TypeORM</strong>. Entities represent DB tables with strong relational data integrity constraints.</div>
</div>

<div class="bg-slate-800/80 border-l-4 border-amber-500 rounded p-4 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300">
  <div class="text-amber-400 font-bold mb-2 flex items-center gap-2">
    <div class="i-carbon-security text-xl"></div> Security & Auth
  </div>
  <div class="text-sm text-gray-300"><strong>JWT Bearer + Passport</strong> handling authentication, and custom Guards for Role-Based Access Control (Admin/User).</div>
</div>

<div class="bg-slate-800/80 border-l-4 border-pink-500 rounded p-4 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300">
  <div class="text-pink-400 font-bold mb-2 flex items-center gap-2">
    <div class="i-carbon-cloud-upload text-xl"></div> Media & Storage
  </div>
  <div class="text-sm text-gray-300"><strong>Cloudinary</strong> integration via multer <code>FileInterceptor</code> for seamless, optimized image uploads.</div>
</div>

</div>

---
layout: default
---

# Project Structure Overview

```text {4-13|5,11|8,12}
lemea-fragrance-back/
└── src/
    ├── admin/         # Admin Dashboard stats & aggregations
    ├── auth/          # JWT tokens, login mechanics, Roles Guards
    ├── categories/    # Product grouping logic
    ├── cloudinary/    # Asset handling (Perfume Images via CloudinaryProvider)
    ├── contact/       # Contact form processing
    ├── orders/        # Checkout, cart persistence, invoice logic
    ├── products/      # Perfume details, inventory management, multer setup
    ├── reviews/       # User generated feedback & ratings
    ├── users/         # Profile management & roles (Admin vs Customer)
    ├── app.module.ts  # Root entry point initializing sub-modules
    └── main.ts        # Global Pipes, Swagger Docs, & CORS setup
```

---
layout: default
---

# The Request Flow & DTOs

How a request travels from the client to the database securely.

<div class="flex items-center justify-between mt-8 text-center text-sm font-bold">
  <div class="w-[18%] bg-slate-800 p-3 rounded border border-slate-600 shadow-xl">1. Client Request</div>
  <div class="text-2xl text-pink-500">→</div>
  <div class="w-[18%] bg-indigo-900/50 p-3 rounded border border-indigo-500 shadow-xl">2. DTO Validation</div>
  <div class="text-2xl text-pink-500">→</div>
  <div class="w-[18%] bg-emerald-900/50 p-3 rounded border border-emerald-500 shadow-xl">3. Controller</div>
  <div class="text-2xl text-pink-500">→</div>
  <div class="w-[18%] bg-amber-900/50 p-3 rounded border border-amber-500 shadow-xl">4. Service (DB)</div>
</div>

<br>

### The Role of DTOs (Data Transfer Objects)
- Defined using `class-validator` decorators. The **Global ValidationPipe** automatically intercepts incoming JSON payloads.
- If a request body doesn't match the DTO, it throws a `400 Bad Request` *before* the Controller is even executed.

```typescript {all|1,2|4,5}
@IsString()
@IsNotEmpty()
@ApiProperty({ description: 'The name of the perfume' })
name: string;
```

---
layout: default
---

# Auth & JWT Logic

Security is implemented globally using Passport strategies and NestJS Guards.

<div class="grid grid-cols-2 gap-6 mt-6">
  <div>
    <div class="bg-gray-800/80 p-4 rounded-lg border border-gray-600 h-full shadow-lg">
      <h3 class="text-indigo-400 font-bold mb-2 flex items-center gap-2">
        <div class="i-carbon-login"></div> 1. Authentication (Login)
      </h3>
      <ul class="text-sm list-disc pl-4 space-y-2 text-gray-300">
        <li>User sends email/password to <code>/auth/login</code>.</li>
        <li>Backend verifies password against hashed DB value using <strong>bcrypt</strong>.</li>
        <li>If valid, signs a <strong>JWT</strong> (JSON Web Token) containing the User ID and Role.</li>
        <li>Token is sent back and attached to headers as a Bearer token for future requests.</li>
      </ul>
    </div>
  </div>
  <div>
    <div class="bg-gray-800/80 p-4 rounded-lg border border-gray-600 h-full shadow-lg">
      <h3 class="text-emerald-400 font-bold mb-2 flex items-center gap-2">
        <div class="i-carbon-security"></div> 2. Authorization (Guards)
      </h3>
      <ul class="text-sm list-disc pl-4 space-y-2 text-gray-300">
        <li><strong>AuthGuard('jwt')</strong>: Protects routes, ensuring the user is logged in.</li>
        <li><strong>RolesGuard</strong>: Reads custom metadata set on specific routes using <code>@Roles('admin')</code>.</li>
        <li>If the user's role from the JWT doesn't match 'admin', it immediately throws a <code>403 Forbidden</code>.</li>
      </ul>
    </div>
  </div>
</div>

---
layout: default
---

# Cloudinary Integration

Images are not stored locally to save server space. Instead, they stream directly to Cloudinary.

<div class="grid grid-cols-2 gap-6 mt-6 items-center">

<div>
<ul class="text-sm space-y-4 text-gray-300 list-disc pl-4">
  <li><strong>File Interception:</strong> Uses <code>FileInterceptor('image', { storage: memoryStorage() })</code> via Multer.</li>
  <li><strong>CloudinaryService:</strong> A custom provider wrapped in a Promise-based upload stream.</li>
  <li><strong>Optimization:</strong> Returns a secure URL, serving images via a global CDN.</li>
</ul>
</div>

<div class="text-[11px]">

```typescript
@Post()
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
async create(@Body() dto: CreateProductDto, @UploadedFile() file: any) {
  let imageUrl = dto.image;
  
  // If an image file was provided, upload it to Cloudinary
  if (file) {
    imageUrl = await this.cloudinaryService.uploadFile(file);
  }

  // Save the product to PostgreSQL with the Cloudinary URL
  return this.productsService.create({ ...dto, image: imageUrl });
}
```
</div>

</div>

---
layout: default
---

# Key API Endpoints

<div class="grid grid-cols-2 gap-4 mt-6">

  <!-- Auth endpoints -->
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">POST</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/auth/login</span>
    <span class="text-[11px] text-gray-400">public • Returns JWT</span>
  </div>
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">POST</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/auth/register</span>
    <span class="text-[11px] text-gray-400">public • New customer</span>
  </div>

  <!-- Products endpoints -->
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">GET</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/products</span>
    <span class="text-[11px] text-gray-400">public • List catalog</span>
  </div>
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">POST</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/products</span>
    <span class="text-[11px] text-gray-400">admin • Includes image</span>
  </div>

  <!-- Orders endpoints -->
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">POST</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/orders</span>
    <span class="text-[11px] text-gray-400">public • Process checkout</span>
  </div>
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">PATCH</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/orders/:id</span>
    <span class="text-[11px] text-gray-400">admin • Update status</span>
  </div>

  <!-- Admin & Users -->
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">GET</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/admin/stats</span>
    <span class="text-[11px] text-gray-400">admin • Dashboard metrics</span>
  </div>
  <div class="border border-slate-600 bg-slate-800/80 rounded p-3 flex items-center gap-3 shadow-md hover:-translate-y-1 transition-transform">
    <span class="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center shadow-lg">DELETE</span>
    <span class="font-mono text-sm font-bold flex-1 text-white">/users/:id</span>
    <span class="text-[11px] text-gray-400">admin • Remove user</span>
  </div>

</div>

---
layout: center
class: text-center
---

<div class="flex flex-col items-center justify-center h-full space-y-8 mt-24">
  <h1 class="text-6xl font-serif font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500 leading-tight">
    Thank You Very Much!
  </h1>
  
  <p class="text-xl text-gray-300 max-w-2xl text-center leading-relaxed">
    Thank you for your time and attention. We appreciate the opportunity to share the backend architecture of Lemea Fragrance with you today!
  </p>
  
  <div class="flex items-center gap-4 mt-8">
    <div class="w-16 h-1 bg-pink-500 rounded"></div>
    <div class="i-carbon-favorite-filled text-4xl text-pink-500 animate-pulse"></div>
    <div class="w-16 h-1 bg-indigo-500 rounded"></div>
  </div>
</div>