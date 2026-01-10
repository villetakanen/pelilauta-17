/**
 * Migration script: Convert statGroups to statBlockGroups
 *
 * This script migrates existing character sheets from the old format:
 *   statGroups: [{key, layout}]  + stats[].group
 *
 * To the new format:
 *   statBlockGroups: [{key, layout, blocks: [{key}]}]  + stats[].block
 *
 * Usage:
 *   node tooling/migrate-stat-blocks.mjs [--dry-run]
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Replace with your service account key file path
import serviceAccount from '../server_principal.json' with { type: 'json' };

const DRY_RUN = process.argv.includes('--dry-run');

async function migrateStatBlocks() {
    console.log('=== StatBlock Migration ===');
    console.log(DRY_RUN ? 'DRY RUN MODE - No changes will be written' : 'LIVE MODE - Changes will be written to Firestore');
    console.log('');

    try {
        // Initialize Firebase Admin SDK
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL: 'https://skaldbase.firebaseio.com',
        });

        const db = getFirestore();
        const sheetsCollection = db.collection('charsheets');

        const snapshot = await sheetsCollection.get();
        if (snapshot.empty) {
            console.log('No character sheets found.');
            return;
        }

        console.log(`Found ${snapshot.size} character sheets to check.`);
        console.log('');

        let migratedCount = 0;
        let skippedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const sheetId = doc.id;

            // Check if migration is needed
            if ('statBlockGroups' in data && !('statGroups' in data)) {
                console.log(`[SKIP] ${sheetId} - Already migrated`);
                skippedCount++;
                continue;
            }

            if (!('statGroups' in data)) {
                console.log(`[SKIP] ${sheetId} - No statGroups field`);
                skippedCount++;
                continue;
            }

            console.log(`[MIGRATE] ${sheetId}`);

            const oldGroups = data.statGroups;
            const oldStats = data.stats || [];

            // Convert statGroups to statBlockGroups
            let statBlockGroups = [];

            if (Array.isArray(oldGroups) && oldGroups.length > 0) {
                const firstItem = oldGroups[0];

                // Old format: string[]
                if (typeof firstItem === 'string') {
                    statBlockGroups = oldGroups.map((groupName) => ({
                        key: groupName,
                        layout: 'cols-1',
                        blocks: [{ key: groupName }],
                    }));
                    console.log(`  - Migrated ${oldGroups.length} string groups`);
                }
                // Old format: {key, layout}[]
                else if (typeof firstItem === 'object' && firstItem !== null && 'key' in firstItem) {
                    statBlockGroups = oldGroups.map((group) => {
                        let layout = 'cols-1';
                        if (group.layout === 'grid-2') layout = 'cols-2';
                        if (group.layout === 'grid-3') layout = 'cols-3';
                        if (group.layout === 'rows') layout = 'cols-1';

                        return {
                            key: group.key,
                            layout,
                            blocks: [{ key: group.key }],
                        };
                    });
                    console.log(`  - Migrated ${oldGroups.length} object groups`);
                }
            }

            // Convert stats.group to stats.block
            const migratedStats = oldStats.map((stat) => {
                if ('group' in stat && !('block' in stat)) {
                    const { group, ...rest } = stat;
                    return { ...rest, block: group };
                }
                return stat;
            });

            const groupToBlockCount = oldStats.filter((s) => 'group' in s && !('block' in s)).length;
            if (groupToBlockCount > 0) {
                console.log(`  - Converted ${groupToBlockCount} stats from group to block`);
            }

            // Prepare update
            const updateData = {
                statBlockGroups,
                stats: migratedStats,
            };

            if (DRY_RUN) {
                console.log(`  - [DRY RUN] Would update with ${statBlockGroups.length} block groups`);
            } else {
                // Remove old statGroups field and add new statBlockGroups
                await doc.ref.update({
                    ...updateData,
                    statGroups: getFirestore.FieldValue?.delete?.() ?? null,
                });

                // If FieldValue.delete() doesn't work, do a set with merge
                await doc.ref.set(updateData, { merge: true });

                console.log(`  - Updated successfully`);
            }

            migratedCount++;
        }

        console.log('');
        console.log('=== Migration Complete ===');
        console.log(`Migrated: ${migratedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        if (DRY_RUN) {
            console.log('');
            console.log('This was a dry run. Run without --dry-run to apply changes.');
        }
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

migrateStatBlocks();
