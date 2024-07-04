<script setup lang="ts">
import { SelectorPerson } from '@lexikos/doraemon-business';
import { Http } from '@lexikos/doraemon-network';
import { message } from 'ant-design-vue';
import { onMounted, ref } from 'vue';

const globalApprovers = ref<any[]>([]);

async function fetchGlobalApprovers() {
  try {
    const res = await Http.getInstance().get('/api/eduRes/approverConfigs/getGlobalApprovers?locationId=');

    globalApprovers.value = res?.map((v: { id: string }) => v.id) || [];
  } catch (error) {
    console.log(error);
    message.error(error?.desc || '加载全局审核人失败！');
  }
}

async function handleSetGlobalApprovers(personData: any[]) {
  try {
    await Http.getInstance().post('/api/eduRes/approverConfigs/addGlobalApprovers', personData);
    message.success('设置成功！');
    await fetchGlobalApprovers();
  } catch (error) {
    console.error('addGlobalViewers error:', error);
    message.error(error?.desc || '设置失败！');
  }
}

onMounted(() => {
  fetchGlobalApprovers();
});
</script>

<template>
  <div>
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px">全局审核人设置</div>
    <SelectorPerson
      v-model:value="globalApprovers"
      title="新增全局审核人"
      placeholder="新增全局审核人"
      @change="handleSetGlobalApprovers"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
