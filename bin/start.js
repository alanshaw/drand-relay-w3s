#!/usr/bin/env node

import * as uint8arrays from 'uint8arrays'
import fetch from '@web-std/fetch'
import AbortController from 'abort-controller'
import dotenv from 'dotenv'
import path from 'path'
import * as Server from '../index.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

global.fetch = fetch
global.AbortController = AbortController

const { W3S_TOKEN, W3S_NAME_SIGNING_KEY } = process.env

if (!W3S_TOKEN) throw new Error('missing W3S_TOKEN')
if (!W3S_NAME_SIGNING_KEY) throw new Error('missing W3S_NAME_SIGNING_KEY')

const signingKey = uint8arrays.fromString(W3S_NAME_SIGNING_KEY, 'base64pad')

Server.start(W3S_TOKEN, signingKey)
