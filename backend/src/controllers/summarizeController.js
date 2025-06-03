const OpenAI = require('openai');
const { HfInference } = require('@huggingface/inference');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const generateSummaries = async (req, res) => {
  try {
    const { text, model1, model2 } = req.body;

    if (!text || !model1 || !model2) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Determine which model is closed source and which is open source
    const isModel1Closed = model1.startsWith('gpt') || model1.startsWith('claude');
    const closedModel = isModel1Closed ? model1 : model2;
    const openModel = isModel1Closed ? model2 : model1;

    // Generate summary from closed source model
    const closedSourceSummary = await generateClosedSourceSummary(text, closedModel);
    
    // Generate summary from open source model
    const openSourceSummary = await generateOpenSourceSummary(text, openModel);

    // Return summaries in the order they were requested
    const response = {
      summary1: isModel1Closed ? closedSourceSummary : openSourceSummary,
      summary2: isModel1Closed ? openSourceSummary : closedSourceSummary,
      model1: {
        name: model1,
        type: isModel1Closed ? 'closed' : 'open'
      },
      model2: {
        name: model2,
        type: isModel1Closed ? 'open' : 'closed'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating summaries:', error);
    res.status(500).json({ error: 'Failed to generate summaries' });
  }
};

const generateClosedSourceSummary = async (text, model) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text. Provide a clear and concise summary."
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error with closed source model:', error);
    throw new Error('Failed to generate summary from closed source model');
  }
};

const generateOpenSourceSummary = async (text, model) => {
  try {
    const response = await hf.textGeneration({
      model: model,
      inputs: text,
      parameters: {
        max_length: 150,
        temperature: 0.7,
        return_full_text: false
      }
    });

    return response.generated_text.trim();
  } catch (error) {
    console.error('Error with open source model:', error);
    throw new Error('Failed to generate summary from open source model');
  }
};

module.exports = {
  generateSummaries
}; 