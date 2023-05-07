from keras.models import Model
from keras.layers import Input, LSTM, Dense, Dropout
from keras import optimizers, metrics, backend as K

import codecs
import re
import unidecode
import numpy as np

from keras.models import Model, load_model
from keras.layers import Input

import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'


np.random.seed(1234)


class CLASS1(object):
    def __init__(self):
        self.VAL_MAXLEN = 16        
        self.SOS = '\t' # start of sequence.
        self.EOS = '*' # end of sequence.
        self.CHARS = list('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
        self.REMOVE_CHARS = '[\'()+#$%"\@<=>!&,-.?:;*\[\]^_`{|}~/\t\n\r\x0b\x0c\xa0]'


    def truncated_acc(self, y_true, y_pred):
        y_true = y_true[:, :self.VAL_MAXLEN, :]
        y_pred = y_pred[:, :self.VAL_MAXLEN, :]
        
        acc = metrics.categorical_accuracy(y_true, y_pred)
        return K.mean(acc, axis=-1)


    def truncated_loss(self, y_true, y_pred):
        y_true = y_true[:, :self.VAL_MAXLEN, :]
        y_pred = y_pred[:, :self.VAL_MAXLEN, :]
        
        loss = K.categorical_crossentropy(
            target=y_true, output=y_pred, from_logits=False)
        return K.mean(loss, axis=-1)


    def seq2seq(self, hidden_size, nb_input_chars, nb_target_chars):
        """Adapted from:
        https://github.com/keras-team/keras/blob/master/examples/lstm_seq2seq.py
        """
        
        # Define the main model consisting of encoder and decoder.
        encoder_inputs = Input(shape=(None, nb_input_chars),
                            name='encoder_data')
        encoder_lstm = LSTM(hidden_size, recurrent_dropout=0.2,
                            return_sequences=True, return_state=False,
                            name='encoder_lstm_1')
        encoder_outputs = encoder_lstm(encoder_inputs)
        
        encoder_lstm = LSTM(hidden_size, recurrent_dropout=0.2,
                            return_sequences=False, return_state=True,
                            name='encoder_lstm_2')
        encoder_outputs, state_h, state_c = encoder_lstm(encoder_outputs)
        # We discard `encoder_outputs` and only keep the states.
        encoder_states = [state_h, state_c]

        # Set up the decoder, using `encoder_states` as initial state.
        decoder_inputs = Input(shape=(None, nb_target_chars),
                            name='decoder_data')
        # We set up our decoder to return full output sequences,
        # and to return internal states as well. We don't use the return
        # states in the training model, but we will use them in inference.
        decoder_lstm = LSTM(hidden_size, dropout=0.2, return_sequences=True,
                            return_state=True, name='decoder_lstm')
        decoder_outputs, _, _ = decoder_lstm(decoder_inputs,
                                            initial_state=encoder_states)
        decoder_softmax = Dense(nb_target_chars, activation='softmax',
                                name='decoder_softmax')
        decoder_outputs = decoder_softmax(decoder_outputs)

        # The main model will turn `encoder_input_data` & `decoder_input_data`
        # into `decoder_target_data`
        model = Model(inputs=[encoder_inputs, decoder_inputs],
                    outputs=decoder_outputs)
        
        adam = optimizers.Adam(lr=0.001, decay=0.0)
        model.compile(optimizer=adam, loss='categorical_crossentropy',
                    metrics=['accuracy', self.truncated_acc, self.truncated_loss])
        
        # Define the encoder model separately.
        encoder_model = Model(inputs=encoder_inputs, outputs=encoder_states)

        # Define the decoder model separately.
        decoder_state_input_h = Input(shape=(hidden_size,))
        decoder_state_input_c = Input(shape=(hidden_size,))
        decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
        decoder_outputs, state_h, state_c = decoder_lstm(
            decoder_inputs, initial_state=decoder_states_inputs)
        decoder_states = [state_h, state_c]
        decoder_outputs = decoder_softmax(decoder_outputs)
        decoder_model = Model(inputs=[decoder_inputs] + decoder_states_inputs,
                            outputs=[decoder_outputs] + decoder_states)

        return model, encoder_model, decoder_model

    def read_text(self, data_path):
        with codecs.open(data_path, 'r', encoding='latin-1') as f:
            strings = unidecode.unidecode(f.read())
        return strings




    def tokenize(self, text):
        tokens = [re.sub(self.REMOVE_CHARS, ' ', token)
                for token in re.split("[-\n ]", text)]
        return tokens

        
    def add_spelling_errors(self, token, error_rate):
        """Simulate some artificial spelling mistakes."""
        assert(0.0 <= error_rate < 1.0)
        if len(token) < 3:
            return token
        rand = np.random.rand()
        # Here are 4 different ways spelling mistakes can occur,
        # each of which has equal chance.
        prob = error_rate / 4.0
        if rand < prob:
            # Replace a character with a random character.
            random_char_index = np.random.randint(len(token))
            token = token[:random_char_index] + np.random.choice(self.CHARS) \
                    + token[random_char_index + 1:]
        elif prob < rand < prob * 2:
            # Delete a character.
            random_char_index = np.random.randint(len(token))
            token = token[:random_char_index] + token[random_char_index + 1:]
        elif prob * 2 < rand < prob * 3:
            # Add a random character.
            random_char_index = np.random.randint(len(token))
            token = token[:random_char_index] + np.random.choice(self.CHARS) \
                    + token[random_char_index:]
        elif prob * 3 < rand < prob * 4:
            # Transpose 2 characters.
            random_char_index = np.random.randint(len(token) - 1)
            token = token[:random_char_index]  + token[random_char_index + 1] \
                    + token[random_char_index] + token[random_char_index + 2:]
        else:
            # No spelling errors.
            pass
        return token


    def transform(self, tokens, maxlen, error_rate=0.3, shuffle=True):
        """Transform tokens into model inputs and targets.
        All inputs and targets are padded to maxlen with EOS character.
        """
        if shuffle:
            print('Shuffling data.')
            np.random.shuffle(tokens)
        encoder_tokens = []
        decoder_tokens = []
        target_tokens = []
        for token in tokens:
            encoder = self.add_spelling_errors(token, error_rate=error_rate)
            encoder += self.EOS * (maxlen - len(encoder)) # Padded to maxlen.
            encoder_tokens.append(encoder)
        
            decoder = self.SOS + token
            decoder += self.EOS * (maxlen - len(decoder))
            decoder_tokens.append(decoder)
        
            target = decoder[1:]
            target += self.EOS * (maxlen - len(target))
            target_tokens.append(target)
            
            assert(len(encoder) == len(decoder) == len(target))
        return encoder_tokens, decoder_tokens, target_tokens


    def batch(self, tokens, maxlen, ctable, batch_size=128, reverse=False):
        """Split data into chunks of `batch_size` examples."""
        def generate(tokens, reverse):
            while(True): # This flag yields an infinite generator.
                for token in tokens:
                    if reverse:
                        token = token[::-1]
                    yield token
        
        token_iterator = generate(tokens, reverse)
        data_batch = np.zeros((batch_size, maxlen, ctable.size),
                            dtype=np.float32)
        while(True):
            for i in range(batch_size):
                token = next(token_iterator)
                data_batch[i] = ctable.encode(token, maxlen)
            yield data_batch


    def datagen(self, encoder_iter, decoder_iter, target_iter):
        """Utility function to load data into required model format."""
        inputs = zip(encoder_iter, decoder_iter)
        while(True):
            encoder_input, decoder_input = next(inputs)
            target = next(target_iter)
            yield ([encoder_input, decoder_input], target)


    def decode_sequences(self, inputs, input_ctable, target_ctable,
                        maxlen, reverse, encoder_model, decoder_model,
                        nb_examples, sample_mode='argmax', random=True):
        input_tokens = []
        # target_tokens = []
        
        if random:
            indices = np.random.randint(0, len(inputs), nb_examples)
        else:
            indices = range(nb_examples)
            
        for index in indices:
            input_tokens.append(inputs[index])
            # target_tokens.append(targets[index])
        input_sequences = self.batch(input_tokens, maxlen, input_ctable,
                                nb_examples, reverse)
        input_sequences = next(input_sequences)
        
        # Procedure for inference mode (sampling):
        # 1) Encode input and retrieve initial decoder state.
        # 2) Run one step of decoder with this initial state
        #    and a start-of-sequence character as target.
        #    Output will be the next target character.
        # 3) Repeat with the current target character and current states.

        # Encode the input as state vectors.    
        states_value = encoder_model.predict(input_sequences) #step 1
        
        # Create batch of empty target sequences of length 1 character.
        target_sequences = np.zeros((nb_examples, 1, target_ctable.size))
        # Populate the first element of target sequence
        # with the start-of-sequence character.
        target_sequences[:, 0, target_ctable.char2index[self.SOS]] = 1.0

        # Sampling loop for a batch of sequences.
        # Exit condition: either hit max character limit
        # or encounter end-of-sequence character.
        decoded_tokens = [''] * nb_examples
        for _ in range(maxlen):
            # `char_probs` has shape
            # (nb_examples, 1, nb_target_chars)
            char_probs, h, c = decoder_model.predict(
                [target_sequences] + states_value)

            # Reset the target sequences.
            target_sequences = np.zeros((nb_examples, 1, target_ctable.size))

            # Sample next character using argmax or multinomial mode.
            sampled_chars = []
            for i in range(nb_examples):
                if sample_mode == 'argmax':
                    next_index, next_char = target_ctable.decode(
                        char_probs[i], calc_argmax=True)
                elif sample_mode == 'multinomial':
                    next_index, next_char = target_ctable.sample_multinomial(
                        char_probs[i], temperature=0.5)
                else:
                    raise Exception(
                        "`sample_mode` accepts `argmax` or `multinomial`.")
                decoded_tokens[i] += next_char
                sampled_chars.append(next_char) 
                # Update target sequence with index of next character.
                target_sequences[i, 0, next_index] = 1.0

            stop_char = set(sampled_chars)
            if len(stop_char) == 1 and stop_char.pop() == self.EOS:
                break
                
            # Update states.
            states_value = [h, c]
        
        # Sampling finished.
        input_tokens   = [re.sub('[%s]' % self.EOS, '', token)
                        for token in input_tokens]
        decoded_tokens = [re.sub('[%s]' % self.EOS, '', token)
                        for token in decoded_tokens]
        return input_tokens, decoded_tokens


    def restore_model(self, path_to_full_model, hidden_size):
        """Restore model to construct the encoder and decoder."""
        model = load_model(path_to_full_model, custom_objects={
            'truncated_acc': self.truncated_acc, 'truncated_loss': self.truncated_loss})
        
        encoder_inputs = model.input[0] # encoder_data
        encoder_lstm1 = model.get_layer('encoder_lstm_1')
        encoder_lstm2 = model.get_layer('encoder_lstm_2')
        
        encoder_outputs = encoder_lstm1(encoder_inputs)
        _, state_h, state_c = encoder_lstm2(encoder_outputs)
        encoder_states = [state_h, state_c]
        encoder_model = Model(inputs=encoder_inputs, outputs=encoder_states)

        decoder_inputs = model.input[1] # decoder_data
        decoder_state_input_h = Input(shape=(hidden_size,))
        decoder_state_input_c = Input(shape=(hidden_size,))
        decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
        decoder_lstm = model.get_layer('decoder_lstm')
        decoder_outputs, state_h, state_c = decoder_lstm(
            decoder_inputs, initial_state=decoder_states_inputs)
        decoder_states = [state_h, state_c]
        decoder_softmax = model.get_layer('decoder_softmax')
        decoder_outputs = decoder_softmax(decoder_outputs)
        decoder_model = Model(inputs=[decoder_inputs] + decoder_states_inputs,
                            outputs=[decoder_outputs] + decoder_states)
        return encoder_model, decoder_model

class CharacterTable(object):
    """Given a set of characters:
    + Encode them to a one-hot integer representation
    + Decode the one-hot integer representation to their character output
    + Decode a vector of probabilities to their character output
    """
    def __init__(self, chars):
        """Initialize character table.
        # Arguments
          chars: Characters that can appear in the input.
        """
        self.chars = sorted(set(chars))
        self.char2index = dict((c, i) for i, c in enumerate(self.chars))
        self.index2char = dict((i, c) for i, c in enumerate(self.chars))
        self.size = len(self.chars)
    
    def encode(self, C, nb_rows):
        """One-hot encode given string C.
        # Arguments
          C: string, to be encoded.
          nb_rows: Number of rows in the returned one-hot encoding. This is
          used to keep the # of rows for each data the same via padding.
        """
        x = np.zeros((nb_rows, len(self.chars)), dtype=np.float32)
        for i, c in enumerate(C):
            x[i, self.char2index[c]] = 1.0
        return x

    def decode(self, x, calc_argmax=True):
        """Decode the given vector or 2D array to their character output.
        # Arguments
          x: A vector or 2D array of probabilities or one-hot encodings,
          or a vector of character indices (used with `calc_argmax=False`).
          calc_argmax: Whether to find the character index with maximum
          probability, defaults to `True`.
        """
        if calc_argmax:
            indices = x.argmax(axis=-1)
        else:
            indices = x
        chars = ''.join(self.index2char[ind] for ind in indices)
        return indices, chars

    def sample_multinomial(self, preds, temperature=1.0):
        """Sample index and character output from `preds`,
        an array of softmax probabilities with shape (1, 1, nb_chars).
        """
        # Reshaped to 1D array of shape (nb_chars,).
        preds = np.reshape(preds, len(self.chars)).astype(np.float64)
        preds = np.log(preds) / temperature
        exp_preds = np.exp(preds)
        preds = exp_preds / np.sum(exp_preds)
        probs = np.random.multinomial(1, preds, 1)
        index = np.argmax(probs)
        char  = self.index2char[index]
        return index, char

class FINAL_CLASS(object):

    def __init__(self, model_path, data_path):
        self.error_rate = 0.8
        self.reverse = True
        self.model_path = model_path
        self.hidden_size = 512
        self.sample_mode = 'argmax'
        self.data_path = data_path

        self.obj = CLASS1()
        self.text  = self.obj.read_text(self.data_path)
        self.vocab = self.obj.tokenize(self.text)

    def correct_spelling(self, test_sentence):    

        vocab = list(filter(None, set(self.vocab)))

        maxlen = max([len(token) for token in vocab]) + 2

        train_encoder, train_decoder, train_target = self.obj.transform(
            vocab, maxlen, error_rate=self.error_rate, shuffle=False)

        tokens = self.obj.tokenize(test_sentence)
        tokens = list(filter(None, tokens))
        nb_tokens = len(tokens)

        misspelled_tokens = [token+"*"*(maxlen-len(token)) for token in tokens]

        input_chars = set(' '.join(train_encoder))
        target_chars = set(' '.join(train_decoder))
        input_ctable = CharacterTable(input_chars)
        target_ctable = CharacterTable(target_chars)

        encoder_model, decoder_model = self.obj.restore_model(self.model_path, self.hidden_size)

        input_tokens, decoded_tokens = self.obj.decode_sequences(
            misspelled_tokens, input_ctable, target_ctable,
            maxlen, self.reverse, encoder_model, decoder_model, nb_tokens,
            sample_mode = self.sample_mode, random=False)

        return ('Decoded sentence:', ' '.join([token for token in decoded_tokens]))

sc_medicine_model = FINAL_CLASS("backend/model/trained_model/SCModel/Medicine.h5", "backend/model/datasets/SCData/Medicine.txt")
sc_nonmed_model = FINAL_CLASS("backend/model/trained_model/SCModel/NonMed.h5", "backend/model/datasets/SCData/NonMed.txt")