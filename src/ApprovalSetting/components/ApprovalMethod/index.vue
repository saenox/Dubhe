<script setup lang="ts">
import { LocationType } from '@lexikos/doraemon-business';
import { Http } from '@lexikos/doraemon-network';
import { message } from 'ant-design-vue';
import { inject, onMounted, reactive, ref } from 'vue';
import { type Context, ContextKey } from '../../utils';

enum ApprovalMethod {
  Recommend = '1',
  Independent = '2',
}

const approvalMethod = reactive({
  id: '',
  configValue: '',
});

async function fetchApprovalSettings() {
  try {
    const res = await Http.getInstance().get('/api/eduRes/eduResBaseConfigs/approvalMethod');
    approvalMethod.id = res?.id;
    approvalMethod.configValue = res?.ApprovalMethod;
  } catch (error) {
    console.log(error);
    message.error(error?.desc || '加载审核方式失败！');
  }
}

async function handleSaveApprovalMethod() {
  try {
    await Http.getInstance().post('/api/eduRes/eduResBaseConfigs/actions/setting', {
      id: approvalMethod.id,
      configKey: 'ApprovalMethod',
      configValue: approvalMethod.configValue,
    });

    message.success('设置成功！');

    await fetchApprovalSettings();
  } catch (error) {
    console.log(error);
    message.error(error?.desc || '设置失败！');
  }
}

const { locationType } = inject<Pick<Context, 'locationType'>>(ContextKey, {
  locationType: ref(''),
});

onMounted(() => {
  fetchApprovalSettings();
});
</script>

<template>
  <div v-show="LocationType.PreprimaryEducation !== locationType" class="approval-setting__method">
    <a-form>
      <a-row><span class="approval-setting__method__title"> 审核方式设置 </span></a-row>
      <a-radio-group v-model:value="approvalMethod.configValue" @change="handleSaveApprovalMethod">
        <a-row>
          <a-radio :value="ApprovalMethod.Recommend">由校>区县>市>省逐级审核，逐级推荐</a-radio>
        </a-row>
        <a-row>
          <a-radio :value="ApprovalMethod.Independent">允许老师独立投稿到学校、区县、市、省级资源平台</a-radio>
        </a-row>
      </a-radio-group>
    </a-form>
  </div>
</template>

<style scoped lang="scss">
.approval-setting__method__title {
  font-weight: bold;
}
</style>
