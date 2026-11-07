# PINOYPROTO 3D WORKSPACE

A responsive, browser-based dashboard starter for PINOYPROTO 3D.

## Included tools
- Dashboard overview
- Customer Tracker (add, edit, search, delete)
- Customer Feedback Renderer (1080 × 1080 PNG export)
- Quotation Maker (live preview, item pricing, save, print / Save as PDF)
- Saved Quotations (load, search, delete)

## Publish with GitHub Pages
1. Create a public GitHub repository named `pinoyproto-3d-workspace`.
2. Upload all files and folders in this project to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for deployment and open the URL shown in Pages.

## Important data note
This is a front-end starter. Customer records and quotations are stored in the browser using localStorage. They do not sync to other devices and can be lost if browser data is cleared. Do not use this version to store sensitive customer information. For shared, reliable records, connect a database and authentication (for example, Supabase or Firebase) before using it for real customer data.

## Pricing defaults
The quotation form starts with ₱3 per gram and ₱55 per print hour. These are editable defaults; update them to your current rates before sending a quotation.

## How quotation totals are calculated
For each line: `(grams × material rate + print hours × print rate) × quantity`, plus additional charges. Each line item includes description, quantity, material grams, and print hours.
