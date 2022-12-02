import { type NextPage } from "next";
import { GetServerSideProps } from 'next'
import Head from "next/head";

type HomePageProps = {
  prs: PR[]
}

type Assignee = {
  id: number
  login: string
  avatar_url: string
}

type Label = {
  id: number
  url: string
  name: string
  description: string
  color: string
}

type PR = {
  id: number
  number: number
  "html_url": string
  title: string
  labels: Label[]
  assignee: Assignee | undefined
}

const LabelBadge = (label: Label) => {
  const divStyle = {
    backgroundColor: `#${label.color}`
  }

  return (
    <div
      key={label.id}
      className="rounded-sm p-0.5 text-xs text-black font-bold"
      style={divStyle}
      >
      {label.name}
    </div>
  )
}

const Column: React.FC<{ title : string, prs: PR[] }> = ({ title, prs }) => {
  return (
    <div>
      <h1 className="text-white font-bold mb-8 text-center">{title} ({prs.length})</h1>
      {prs.map(Card)}
    </div>
  )
}

const AssigneeLabel: React.FC<{ assignee : Assignee }> = ({ assignee })=> {
  return (
    <img
      className="h-8 w-8 rounded-full border-2 absolute top-0 right-0"
      src={assignee.avatar_url}
    />
  )
}

const Card = (pr: PR) => {
  return (
    <a
      className="flex max-w-xs flex-col gap-2 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 mb-2 relative"
      href={pr["html_url"]}
      key={pr.id}
    >
      { pr.assignee && <AssigneeLabel assignee={pr.assignee} /> }
      <h3 className="text-sm font-bold">#{pr.number}</h3>
      <div className="text-xs">
        {pr.title}
      </div>
      {pr.labels.map(LabelBadge)}
    </a>
  )
}

const Home: NextPage<HomePageProps> = ({ prs }) => {
  return (
    <>
      <Head>
        <title>Lanes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">{prs.length}</span> PRs
          </h1>

          <div className="grid grid-cols-6 gap-2">
            <Column title="Needs Triage" prs={prs.filter(pr => pr.labels.length == 0)} />
            <Column title="In Progress" prs={prs.filter(pr => pr.labels.find(label => label.name == "pr:work-in-progress"))} />
            <Column title="Needs Review" prs={prs.filter(pr => pr.labels.find(label => label.name == "needs:review"))} />
            <Column title="Blocked" prs={prs.filter(pr => pr.labels.find(label => label.name == "pr:do-not-land"))} />
            <Column title="Needs Changes" prs={prs.filter(pr => pr.labels.find(label => label.name == "pr:needs-changes"))} />
            <Column title="Needs Landing" prs={prs.filter(pr => pr.labels.find(label => label.name == "pr:approved"))} />
          </div>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const res = await fetch('https://api.github.com/repos/mozilla-mobile/fenix/pulls?per_page=100')
  const data: PR[] = await res.json()
  return {
    props: {
      prs: data
    }
  }
}

export default Home;
