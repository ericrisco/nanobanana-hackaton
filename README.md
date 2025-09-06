# 🌍 Terraformer

**Transform satellite imagery into artistic street-level interpretations using AI**

Terraformer is an innovative web application that takes satellite imagery from any location on Earth and uses Google's Gemini AI to generate creative, street-level views populated by different inhabitants across various time periods and artistic styles.

## ✨ Features

- 🗺️ **Interactive Map**: Click anywhere on the map or use preset famous locations
- 🎨 **Multiple Art Styles**: Comic, Realistic, Futuristic, Destroyed, On Fire, Flooded
- 👾 **Creative Populations**: Real persons, Bananas, Robots, Zoo animals, Sea animals, Ghosts, Superheroes
- ⏰ **Time Periods**: Present Day, Ancient Rome, Medieval Times, 1920s Art Deco, 1980s Cyberpunk, Distant Future, Prehistoric
- 🔥 **Street-Level Perspective**: Generates first-person ground-level views as if you were walking there
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Download Generated Images**: Save your AI-generated artwork locally

## 🚀 How It Works

1. **Drop a Pin**: Click anywhere on the map to select a location (or use preset locations like Sagrada Familia, Eiffel Tower, etc.)
2. **Choose Parameters**: Select your desired style, population, and time period
3. **Generate**: Hit the GENERATE button and let AI create magic
4. **View & Download**: Your unique street-level interpretation appears, ready to be saved

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.2](https://nextjs.org/) with App Router
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Maps**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) with [@react-google-maps/api](https://react-google-maps-api-docs.netlify.app/)
- **AI**: [Google Gemini AI](https://ai.google.dev/) (gemini-2.5-flash-image-preview)
- **Deployment**: Optimized for Vercel/Netlify deployment

## 📋 Prerequisites

Before running Terraformer, you'll need API keys for:

1. **Google AI Studio API Key** - [Get it here](https://www.youtube.com/watch?v=3A2TQ8YOw9k) (Tutorial)
2. **Google Maps API Key** - [Get it here](https://www.youtube.com/watch?v=c9BDfSbAd6I&t=2s) (Tutorial)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ericrisco/nanobanana-hackaton.git
   cd nanobanana-hackaton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Enter your API keys**
   The app will prompt you to enter your Google AI Studio and Google Maps API keys on first visit.

### Building for Production

```bash
npm run build
npm run start
```

## 🔧 Configuration

### API Keys Setup

The application requires two API keys that are stored locally in your browser:

- **Google AI Studio API Key**: Used for AI image generation
- **Google Maps API Key**: Used for map display and satellite imagery

These keys are requested on the first app launch and stored in localStorage. You can reset them anytime using the "Reset Keys" button.

### Environment Variables (Optional)

Create a `.env.local` file for additional configuration:

```env
# Optional: Default API keys (not recommended for production)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here
```

## 📁 Project Structure

```
terraformer/
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts    # AI image generation API
│   │   ├── layout.tsx               # App layout and metadata
│   │   ├── page.tsx                 # Main application page
│   │   └── globals.css              # Global styles
│   └── components/
│       ├── ImageDisplay.tsx         # Generated image display
│       ├── LocationButtons.tsx      # Preset location buttons
│       ├── MapView.tsx             # Google Maps component
│       ├── PopulationSelector.tsx   # Population type selector
│       ├── SetupScreen.tsx         # API keys setup screen
│       ├── StyleSelector.tsx       # Art style selector
│       ├── TimePeriodSelector.tsx  # Time period selector
│       └── mapStyles.ts            # Google Maps styling
├── public/
│   ├── favicon.ico                 # App icons
│   └── ...
└── package.json                    # Dependencies and scripts
```

## 🎮 Usage Examples

### Example Generations

- **Times Square + Comic Style + Bananas + 1980s**: A vibrant comic-book street view of Times Square populated entirely by bananas in 80s aesthetic
- **Eiffel Tower + On Fire + Robots + Medieval**: A burning medieval Paris with robots roaming the streets around the Eiffel Tower
- **Big Ben + Flooded + Sea Animals + Present Day**: Modern London streets underwater with sea creatures swimming around Big Ben

### Available Preset Locations

- 🏛️ **Sagrada Familia** (Barcelona)
- 🗼 **Eiffel Tower** (Paris)
- 🕐 **Big Ben** (London)
- 🌆 **Times Square** (New York)
- 🌉 **Golden Gate** (San Francisco)
- 🏺 **Giza Pyramids** (Cairo)

## 🐛 Troubleshooting

### Common Issues

1. **"Google Maps API key is not configured"**
   - Ensure you've entered a valid Google Maps API key
   - Check that the Maps JavaScript API is enabled in Google Cloud Console

2. **"Unable to generate image"**
   - Try a different location or style combination
   - Some locations may not work well with certain artistic styles
   - Check the error modal for detailed debugging information

3. **API Rate Limits**
   - Gemini AI has usage quotas - wait a few moments between generations
   - Consider upgrading your Google AI Studio plan for higher limits

### Debug Mode

The application includes comprehensive error logging. Check browser console and the detailed error modal for API response information.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google AI](https://ai.google.dev/) for the Gemini AI model
- [Google Maps Platform](https://developers.google.com/maps) for mapping services
- [Next.js](https://nextjs.org/) for the awesome React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you have questions or need help:

1. Check the [Issues](https://github.com/ericrisco/nanobanana-hackaton/issues) page
2. Create a new issue if your problem isn't already reported
3. Include error messages and steps to reproduce

---

**Made with ❤️ for the AI + Maps hackathon**

*Transform any place on Earth into your wildest artistic imagination!*