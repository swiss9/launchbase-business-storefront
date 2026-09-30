# LaunchBase

A premium, production-ready business storefront template built with Next.js and Supabase.

Launch a professional product catalog with reviews, an admin dashboard, and instant customer communication through WhatsApp, Telegram, Discord, or Viber — without building everything from scratch.

## Features

- 🛍️ **Product storefront** — Showcase products in a clean, responsive catalog.
- 💬 **Instant chat ordering** — Let customers contact you through WhatsApp, Telegram, Discord, or Viber.
- ⭐ **Ratings & reviews** — Dedicated review pages for individual products.
- 🔐 **Admin dashboard** — Manage products, reviews, and business information without editing code.
- 👥 **Admin management** — The first admin can promote or remove other administrators.
- ⚡ **Automatic admin setup** — The first person who signs up becomes the store owner.
- 📱 **Responsive design** — Works across mobile, tablet, and desktop.
- 💰 **Zero-cost stack** — Built with Next.js and Supabase, both offering free tiers.
- 🚀 **Easy deployment** — Deploy to Vercel or Netlify.

## Tech Stack

- Next.js
- TypeScript
- Supabase
- React
- Vercel / Netlify

## Quick Start

### 1. Create your own repository

Click **Use this template** on GitHub to create your own copy.

### 2. Install dependencies

Clone your repository and run:

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Your local development server will be available at:

```text
http://localhost:3000
```

### 4. Connect Supabase

Follow the instructions in [`SETUP.md`](./SETUP.md) to:

* Create your Supabase project
* Configure your environment variables
* Run the database migration
* Configure authentication

### 5. Deploy

LaunchBase can be deployed to Vercel or Netlify.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fswiss2099%2FLBS)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/swiss2099/LBS)

## Admin Dashboard

After connecting your Supabase project:

1. Start the website.
2. Create an account.
3. The first person who signs up automatically becomes the owner/admin.
4. Visit:

```text
/admin
```

From the admin dashboard you can manage:

* Products
* Reviews
* Business details
* Other administrators

The first admin can also promote or remove other admins.

## Product Ordering

Product cards use **Order via Chat** by default.

The chat button can be connected to:

* WhatsApp
* Telegram
* Discord
* Viber

To change the button text, open:

```text
src/components/ProductCard.tsx
```

and edit the button text around line 182.

Common alternatives include:

* `Book Now`
* `Inquire`
* `Chat with Us`
* `Buy Now`

## Customization

LaunchBase is designed to be customized for your own business or projects.

You can modify:

* Branding
* Colors
* Typography
* Products
* Reviews
* Business information
* Ordering links
* Layout
* Components
* Pages

## License

LaunchBase is licensed under the **LaunchBase Commercial License**.

You may use and modify the template for an unlimited number of websites that you own or control.

You may not resell, redistribute, sublicense, or publish the LaunchBase source code as another template or product.

See [`LICENSE`](./LICENSE) for the complete license terms.

## Support

Please check the documentation and `SETUP.md` before requesting support.

For issues related to the original codebase, open a GitHub issue with:

* A clear description of the problem
* Steps to reproduce it
* Relevant error messages
* Your environment/version information

## Built For

LaunchBase is suitable for:

* Small businesses
* Local businesses
* Product catalogs
* Service businesses
* Small online stores
* Client websites
* Business landing pages with product catalogs
* Developers who want a ready-to-customize storefront foundation

---

**LaunchBase — Start with the foundation, customize it for your business.**
