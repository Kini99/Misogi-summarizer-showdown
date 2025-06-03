import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Rating,
  Stack,
} from '@mui/material';
import axios from 'axios';
import { Model, ModelResponse, SummaryResponse, Rating as RatingType } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Summarizer: React.FC = () => {
  const [models, setModels] = useState<ModelResponse | null>(null);
  const [selectedModel1, setSelectedModel1] = useState<string>('');
  const [selectedModel2, setSelectedModel2] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [summaries, setSummaries] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ratings, setRatings] = useState<{
    model1: RatingType;
    model2: RatingType;
  } | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get<ModelResponse>(`${API_URL}/api/models`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleSummarize = async () => {
    if (!inputText || !selectedModel1 || !selectedModel2) return;

    setLoading(true);
    try {
      const response = await axios.post<SummaryResponse>(`${API_URL}/api/summarize`, {
        text: inputText,
        model1: selectedModel1,
        model2: selectedModel2,
      });
      setSummaries(response.data);
      setRatings(null);
    } catch (error) {
      console.error('Error generating summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ratings || !summaries) return;

    try {
      await axios.post(`${API_URL}/api/ratings`, {
        model1Rating: ratings.model1,
        model2Rating: ratings.model2,
      });
      setRatings(null);
      setSummaries(null);
      setInputText('');
    } catch (error) {
      console.error('Error submitting ratings:', error);
    }
  };

  const handleRatingChange = (modelIndex: number, field: keyof RatingType, value: number | boolean) => {
    if (!summaries) return;

    setRatings((prev) => {
      if (!prev) {
        return {
          model1: {
            modelName: summaries.model1.name,
            modelType: summaries.model1.type,
            clarity: 0,
            accuracy: 0,
            conciseness: 0,
            preferred: false,
          },
          model2: {
            modelName: summaries.model2.name,
            modelType: summaries.model2.type,
            clarity: 0,
            accuracy: 0,
            conciseness: 0,
            preferred: false,
          },
        };
      }

      const newRatings = { ...prev };
      if (field === 'preferred') {
        newRatings.model1.preferred = modelIndex === 0;
        newRatings.model2.preferred = modelIndex === 1;
      } else {
        newRatings[modelIndex === 0 ? 'model1' : 'model2'][field] = value as number;
      }
      return newRatings;
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        LLM Summarizer Showdown
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model 1</InputLabel>
            <Select
              value={selectedModel1}
              label="Model 1"
              onChange={(e) => setSelectedModel1(e.target.value)}
            >
              {models?.closedSource.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model 2</InputLabel>
            <Select
              value={selectedModel2}
              label="Model 2"
              onChange={(e) => setSelectedModel2(e.target.value)}
            >
              {models?.openSource.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Input Text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSummarize}
            disabled={loading || !inputText || !selectedModel1 || !selectedModel2}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Compare Summaries'}
          </Button>
        </Grid>

        {summaries && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {summaries.model1.name}
                </Typography>
                <Typography paragraph>{summaries.summary1}</Typography>
                {!ratings && (
                  <Stack spacing={2}>
                    <Typography>Rate this summary:</Typography>
                    <Box>
                      <Typography>Clarity</Typography>
                      <Rating
                        value={ratings?.model1.clarity || 0}
                        onChange={(_, value) => handleRatingChange(0, 'clarity', value || 0)}
                      />
                    </Box>
                    <Box>
                      <Typography>Accuracy</Typography>
                      <Rating
                        value={ratings?.model1.accuracy || 0}
                        onChange={(_, value) => handleRatingChange(0, 'accuracy', value || 0)}
                      />
                    </Box>
                    <Box>
                      <Typography>Conciseness</Typography>
                      <Rating
                        value={ratings?.model1.conciseness || 0}
                        onChange={(_, value) => handleRatingChange(0, 'conciseness', value || 0)}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => handleRatingChange(0, 'preferred', true)}
                      color={ratings?.model1.preferred ? 'primary' : 'inherit'}
                    >
                      Prefer this summary
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {summaries.model2.name}
                </Typography>
                <Typography paragraph>{summaries.summary2}</Typography>
                {!ratings && (
                  <Stack spacing={2}>
                    <Typography>Rate this summary:</Typography>
                    <Box>
                      <Typography>Clarity</Typography>
                      <Rating
                        value={ratings?.model2.clarity || 0}
                        onChange={(_, value) => handleRatingChange(1, 'clarity', value || 0)}
                      />
                    </Box>
                    <Box>
                      <Typography>Accuracy</Typography>
                      <Rating
                        value={ratings?.model2.accuracy || 0}
                        onChange={(_, value) => handleRatingChange(1, 'accuracy', value || 0)}
                      />
                    </Box>
                    <Box>
                      <Typography>Conciseness</Typography>
                      <Rating
                        value={ratings?.model2.conciseness || 0}
                        onChange={(_, value) => handleRatingChange(1, 'conciseness', value || 0)}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => handleRatingChange(1, 'preferred', true)}
                      color={ratings?.model2.preferred ? 'primary' : 'inherit'}
                    >
                      Prefer this summary
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Grid>

            {ratings && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRatingSubmit}
                  sx={{ mt: 2 }}
                >
                  Submit Ratings
                </Button>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Summarizer; 