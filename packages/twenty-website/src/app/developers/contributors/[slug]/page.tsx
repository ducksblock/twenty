export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

import { Background } from '@/app/components/oss-friends/Background';
import { ActivityLog } from '@/app/developers/contributors/[slug]/components/ActivityLog';
import { Breadcrumb } from '@/app/developers/contributors/[slug]/components/Breadcrumb';
import { ContentContainer } from '@/app/developers/contributors/[slug]/components/ContentContainer';
import { ProfileCard } from '@/app/developers/contributors/[slug]/components/ProfileCard';
import { ProfileInfo } from '@/app/developers/contributors/[slug]/components/ProfileInfo';
import { PullRequests } from '@/app/developers/contributors/[slug]/components/PullRequests';
import { ThankYou } from '@/app/developers/contributors/[slug]/components/ThankYou';
import { findAll } from '@/database/database';
import { pullRequestModel, userModel } from '@/database/model';

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return {
    title: params.slug + ' | Contributors',
  };
}

export default async function ({ params }: { params: { slug: string } }) {
  const contributors = await findAll(userModel);

  const contributor = contributors.find(
    (contributor) => contributor.id === params.slug,
  );

  if (!contributor) {
    return;
  }

  const pullRequests = await findAll(pullRequestModel);
  const mergedPullRequests = pullRequests
    .filter((pr) => pr.mergedAt !== null)
    .filter(
      (pr) =>
        ![
          'dependabot',
          'cyborch',
          'emilienchvt',
          'Samox',
          'charlesBochet',
          'gitstart-app',
          'thaisguigon',
          'lucasbordeau',
          'magrinj',
          'Weiko',
          'gitstart-twenty',
          'bosiraphael',
          'martmull',
          'FelixMalfait',
          'thomtrp',
          'Bonapara',
          'nimraahmed',
        ].includes(pr.authorId),
    );

  const contributorPullRequests = pullRequests.filter(
    (pr) => pr.authorId === contributor.id,
  );
  const mergedContributorPullRequests = contributorPullRequests.filter(
    (pr) => pr.mergedAt !== null,
  );

  const mergedContributorPullRequestsByContributor = mergedPullRequests.reduce(
    (acc, pr) => {
      acc[pr.authorId] = (acc[pr.authorId] || 0) + 1;
      return acc;
    },
    {},
  );

  const mergedContributorPullRequestsByContributorArray = Object.entries(
    mergedContributorPullRequestsByContributor,
  )
    .map(([authorId, value]) => ({ authorId, value }))
    .sort((a, b) => b.value - a.value);

  const contributorRank =
    ((mergedContributorPullRequestsByContributorArray.findIndex(
      (contributor) => contributor.authorId === params.slug,
    ) +
      1) /
      contributors.length) *
    100;

  const pullRequestActivity = contributorPullRequests.reduce((acc, pr) => {
    const date = new Date(pr.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, []);

  const pullRequestActivityArray = Object.entries(pullRequestActivity)
    .map(([day, value]) => ({ day, value }))
    .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

  return (
    <>
      <Background />
      <ContentContainer>
        <Breadcrumb active={contributor.id} />
        <ProfileCard
          username={contributor.id}
          avatarUrl={contributor.avatarUrl}
          firstContributionAt={pullRequestActivityArray[0]?.day}
        />
        <ProfileInfo
          mergedPRsCount={mergedContributorPullRequests.length}
          rank={Math.ceil(Number(contributorRank)).toFixed(0)}
          activeDays={pullRequestActivityArray.length}
        />
        <ActivityLog data={pullRequestActivityArray} />
        <PullRequests
          list={
            contributorPullRequests.slice(0, 9) as {
              id: string;
              title: string;
              url: string;
              createdAt: string;
              mergedAt: string | null;
              authorId: string;
            }[]
          }
        />
        <ThankYou authorId={contributor.login} />
      </ContentContainer>
    </>
  );
}
