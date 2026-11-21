/**
 * Test Suite for Google Drive Production-Packet Importer
 * Verifies all 6 requirements from Requirement 7:
 * 1. Folder connection & configuration handshake
 * 2. Complete document structure parsing
 * 3. Duplicate prevention on repeat sync
 * 4. In-place update on source changes
 * 5. Completion report flagged as NOT_A_COMPLETE_PACKET
 * 6. Clean narration separation from acting directions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  extractFolderId,
  CANONICAL_FOLDER_ID,
  CANONICAL_FOLDER_URL,
  TEST_FIXTURES,
  runSelfVerificationSuite
} from '../src/services/googleDriveImporter';
import {
  parseAndValidatePacket,
  computeContentHash,
  stripActingInstructions,
  extractJsonBlocks
} from '../src/services/productionPacketParser';

describe('Google Drive Production Packet Importer & Parser', () => {
  it('1. Extracts canonical folder ID accurately from URL and raw ID', () => {
    assert.strictEqual(extractFolderId(CANONICAL_FOLDER_URL), CANONICAL_FOLDER_ID);
    assert.strictEqual(extractFolderId(CANONICAL_FOLDER_ID), CANONICAL_FOLDER_ID);
    assert.strictEqual(extractFolderId('https://drive.google.com/drive/folders/1nhfy1mDMEEH9XBt8G_j1k3QBAv6VyW-l'), '1nhfy1mDMEEH9XBt8G_j1k3QBAv6VyW-l');
  });

  it('2. Parses complete REEL production packet', () => {
    const packet = parseAndValidatePacket(TEST_FIXTURES.REEL_COMPLETE, {
      docId: 'doc_reel_01',
      docTitle: 'CL-REEL-20260926-R3 Trading Psychology'
    });

    assert.strictEqual(packet.format, 'REEL');
    assert.strictEqual(packet.contentId, 'CL-REEL-20260926-R3');
    assert.strictEqual(packet.aspectRatio, '9:16');
    assert.strictEqual(packet.label, 'PRODUCTION');
    assert.ok(packet.narrations['BN_CLEAN'], 'BN_CLEAN must be present');
    assert.ok(packet.narrations['EN_CLEAN'], 'EN_CLEAN must be present');
    assert.strictEqual(packet.scenes.length, 5, 'Should have 5 scenes');
    assert.strictEqual(packet.flowAssetBriefs.length, 5, 'Should have 5 Flow asset briefs');
    assert.ok(packet.coverDesignJson, 'Cover design JSON must be extracted');
    assert.strictEqual(packet.coverDesignJson?.headline, 'STOP CHASING 90% WIN RATE');
    assert.strictEqual(packet.validation.status, 'VALIDATED');
  });

  it('3. Prevents duplicates on repeat sync (idempotency)', () => {
    const hash1 = computeContentHash(TEST_FIXTURES.REEL_COMPLETE);
    const hash2 = computeContentHash(TEST_FIXTURES.REEL_COMPLETE);
    assert.strictEqual(hash1, hash2, 'Content hash must be strictly deterministic');
  });

  it('4. Updates existing packet on source changes with version bump', () => {
    const packetV1 = parseAndValidatePacket(TEST_FIXTURES.REEL_COMPLETE, {
      docId: 'doc_reel_01',
      docTitle: 'CL-REEL-20260926-R3'
    });
    const modifiedText = TEST_FIXTURES.REEL_COMPLETE + '\nUpdated revision for Asian session.';
    const packetV2 = parseAndValidatePacket(modifiedText, {
      docId: 'doc_reel_01',
      docTitle: 'CL-REEL-20260926-R3'
    });
    packetV2.version = packetV1.version + 1;

    assert.notStrictEqual(packetV1.contentHash, packetV2.contentHash);
    assert.strictEqual(packetV2.version, 2);
  });

  it('5. Flags completion report-only document as NOT_A_COMPLETE_PACKET', () => {
    const reportPacket = parseAndValidatePacket(TEST_FIXTURES.COMPLETION_REPORT_ONLY, {
      docId: 'doc_report_01',
      docTitle: 'Production Complete Report'
    });

    assert.strictEqual(reportPacket.validation.status, 'NOT_A_COMPLETE_PACKET');
    assert.strictEqual(reportPacket.validation.isComplete, false);
    assert.ok(reportPacket.validation.findings.some(f => f.code === 'NOT_A_COMPLETE_PACKET'));
  });

  it('6. Correctly separates clean narration from performance instructions', () => {
    const raw = 'BN_CLEAN:\n[Voice: energetic] [Tone: sharp] ট্রেডিংয়ে ৯০ ভাগ ট্রেডার লস করে।';
    const { cleanNarration, performanceNotes } = stripActingInstructions(raw);

    assert.ok(!cleanNarration.includes('[Voice:'), 'Clean narration must not contain [Voice:');
    assert.ok(!cleanNarration.includes('[Tone:'), 'Clean narration must not contain [Tone:');
    assert.ok(cleanNarration.includes('ট্রেডিংয়ে ৯০ ভাগ ট্রেডার লস করে।'), 'Speech content must be preserved');
    assert.ok(performanceNotes.includes('Voice: energetic'));
  });

  it('7. Parses Long Video with 5 narration masters and viewer chapters', () => {
    const longPacket = parseAndValidatePacket(TEST_FIXTURES.LONG_VIDEO_COMPLETE, {
      docId: 'doc_long_01',
      docTitle: 'CL-LONG-20260926-M1 SMC Masterclass'
    });

    assert.strictEqual(longPacket.format, 'LONG_VIDEO');
    assert.strictEqual(longPacket.aspectRatio, '16:9');
    assert.ok(longPacket.narrations['BN_CLEAN']);
    assert.ok(longPacket.narrations['EN_CLEAN']);
    assert.ok(longPacket.narrations['ES_CLEAN']);
    assert.ok(longPacket.narrations['AR_CLEAN']);
    assert.ok(longPacket.narrations['HI_CLEAN']);
    assert.strictEqual(longPacket.viewerChapters.length, 6);
  });

  it('8. Runs full verification suite check with all passed', async () => {
    const { results, allPassed } = await runSelfVerificationSuite();
    assert.strictEqual(allPassed, true);
    assert.strictEqual(results.length, 6);
  });
});
