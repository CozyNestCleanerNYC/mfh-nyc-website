# Cozy Nest Cleaners Website

A professional website for Cozy Nest Cleaners, a cleaning service company in NYC.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Professional Layout**: Clean, modern design inspired by top cleaning companies
- **Service Showcase**: Detailed pricing and service descriptions
- **Contact Form**: Interactive form for free estimates
- **GoPro Transparency**: Unique selling point highlighted throughout
- **Eco-Friendly Focus**: Environmental responsibility emphasized
- **Policy Integration**: Easy access to company policies

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Inter & Poppins)

## File Structure

```
cozy-nest-website/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styles
├── js/
│   └── script.js       # JavaScript functionality
├── images/
│   └── cozy_nest_logo.png  # Company logo
├── assets/
│   └── Gmail-policy.pdf    # Company policies
└── README.md           # This file
```

## Local Development

1. Clone or download the project files
2. Open `index.html` in any modern web browser
3. No build process required - it's a static website

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the project directory
3. Run `vercel` and follow the prompts
4. Your site will be deployed with a custom URL

### Option 2: Netlify
1. Drag and drop the entire folder to Netlify
2. Or connect your Git repository to Netlify
3. Automatic deployment on every push

### Option 3: GitHub Pages
1. Push the code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as source

### Option 4: Traditional Web Hosting
1. Upload all files to your web hosting provider
2. Ensure `index.html` is in the root directory
3. Update any absolute paths if necessary

## Customization

### Colors
The color scheme is defined in CSS custom properties at the top of `styles.css`:
- Primary Blue: `#4A90B8`
- Secondary Green: `#7CB342`
- Accent Cream: `#F5F5DC`

### Content
- Update contact information in `index.html`
- Modify service pricing and descriptions
- Replace placeholder phone numbers and email addresses
- Update the logo by replacing `images/cozy_nest_logo.png`

### Policies
- Replace `assets/Gmail-policy.pdf` with your actual policy document
- Update links in the footer to point to your policies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- Optimized images
- Minimal JavaScript
- CSS Grid and Flexbox for efficient layouts
- Smooth scrolling and animations
- Responsive design for all screen sizes

## Contact Form

The contact form includes:
- Client-side validation
- Phone number formatting
- Service type selection
- Frequency options with discount display
- Success/error notifications

Note: The form currently shows a success message for demonstration. For production, you'll need to:
1. Set up a backend service (like Formspree, Netlify Forms, or custom API)
2. Update the form action and method
3. Configure email notifications

## SEO Features

- Semantic HTML structure
- Meta tags for search engines
- Proper heading hierarchy
- Alt text for images
- Clean URL structure

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Proper ARIA labels
- Responsive text sizing

## Support

For any questions or modifications needed, please refer to the code comments or contact the development team.

## License

This website is created specifically for Cozy Nest Cleaners. All rights reserved.

