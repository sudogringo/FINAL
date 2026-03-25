# n8n Automation Workflows - Design Plan

This document outlines the architecture for the n8n subroutines planned for the Golden Harvest S.A. digital transformation.

---

## 1. Automated Branding (Color Extraction)
*   **Description:** Extracts the primary color palette from the live website to ensure marketing materials stay updated with brand changes.
*   **Trigger:** Monthly Schedule or Webhook (on site update).
*   **Design Plan:**
    1.  **HTTP Request:** Fetch the homepage HTML/CSS.
    2.  **Code Node:** Parse CSS variables or compute dominant colors from styles.
    3.  **Storage:** Save hex codes to a "Brand Settings" database (e.g., Airtable/PostgreSQL) for other workflows to consume.
*   **Custom Code (JS):**
    ```javascript
    // Draft: Extracting CSS variables or specific hex patterns from HTML/CSS string
    const htmlContent = items[0].json.html;
    const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const matches = htmlContent.match(hexRegex) || [];
    
    // Simple frequency analysis to find dominant colors
    const colorCounts = matches.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
    
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    return [{ json: { primary: sortedColors[0], secondary: sortedColors[1], palette: sortedColors } }];
    ```

---

## 2. Website Health & SEO Monitor
*   **Description:** Audits the site for speed, SEO, and consistency.
*   **Trigger:** Weekly Schedule (Monday 8:00 AM).
*   **Design Plan:**
    1.  **Google PageSpeed Insights API:** Request audit for mobile/desktop.
    2.  **IF Node:** Check if scores are below 80.
    3.  **Notification:** Send a Slack/Email alert with the report link if issues are found.

---

## 3. Google Maps Review Management
*   **Description:** Monitors reviews and handles responses or escalations.
*   **Trigger:** Poll (Every 6 hours) or Google My Business Webhook.
*   **Design Plan:**
    1.  **Fetch Reviews:** Get latest reviews via API.
    2.  **Sentiment Analysis (Code):** Determine if the review is positive or negative.
    3.  **Branching:**
        *   *Positive (4-5 stars):* Auto-reply with "Thank you" template.
        *   *Negative (1-3 stars):* Extract summary and email the administrator.
*   **Custom Code (JS):**
    ```javascript
    const review = items[0].json;
    const stars = review.starRating;
    const comment = review.comment.toLowerCase();
    
    let action = 'notify_admin';
    let reply = '';

    if (stars >= 4) {
      action = 'auto_reply';
      reply = "¡Gracias por tu reseña! Nos alegra que hayas disfrutado de Golden Harvest.";
    } else if (comment.includes('demora') || comment.includes('roto')) {
      action = 'urgent_admin'; // High priority keywords
    }

    return [{ json: { ...review, action, suggested_reply: reply } }];
    ```

---

## 4. Social Media Content Engine (Stories)
*   **Description:** Generates visual stories for Instagram/WhatsApp using brand colors and product data.
*   **Trigger:** Webhook (New Product) or Schedule (Holidays).
*   **Design Plan:**
    1.  **Asset Collection:** Fetch product image + Geotag info.
    2.  **Branding Fetch:** Retrieve current colors (from Subroutine 1).
    3.  **Image Generation:** Use an API (like Bannerbear or HTML-to-Image) to overlay text and colors on a template.
    4.  **Distribution:** Push to WhatsApp Business API or Instagram Graph API.

---

## 5. Monthly Activity Report
*   **Description:** Aggregates analytics into a business-readable summary.
*   **Trigger:** Schedule (1st of every month).
*   **Design Plan:**
    1.  **Google Analytics 4 API:** Fetch sessions, country of origin, and peak times.
    2.  **Code Node:** Format data into a readable summary.
    3.  **Email:** Send PDF/HTML report to stakeholders.

---

## 6. Personalized Newsletter & Abandoned Carts
*   **Description:** Sends targeted offers based on purchase history and behavior.
*   **Trigger:**
    *   *Newsletter:* Bi-weekly Schedule.
    *   *Abandoned Cart:* Webhook from E-commerce (Wait 2 hours).
*   **Design Plan:**
    1.  **Customer Data:** Fetch history from DB.
    2.  **Logic (Code):** Match "Frequently bought together" or "Restock" items.
    3.  **Email:** Send via SendGrid/Postmark with personalized tracking.
*   **Custom Code (JS):**
    ```javascript
    // Draft: Matching recommended product category
    const history = items[0].json.purchase_history; // Array of categories
    const categories = history.map(h => h.category);
    
    const mostFrequent = categories.reduce((a, b, i, arr) =>
      (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
    );

    return [{ json: { recommended_category: mostFrequent, user_email: items[0].json.email } }];
    ```

---

## 7. Logistics & Shipping Automation
*   **Description:** Generates shipping slips and documentation post-purchase.
*   **Trigger:** Webhook (Order Paid).
*   **Design Plan:**
    1.  **Order Data:** Parse SKU, shipping address, and weights.
    2.  **PDF Generation:** Create label using a template (e.g., PDFMonkey or HTML node).
    3.  **Logistics Integration:** Notify carrier or send label to the warehouse printer.
